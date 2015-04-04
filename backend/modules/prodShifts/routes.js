// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var moment = require('moment');
var limitOrgUnit = require('../prodLines/limitOrgUnit');
var logEntryHandlers = require('../production/logEntryHandlers');

module.exports = function setUpProdShiftsRoutes(app, prodShiftsModule)
{
  var express = app[prodShiftsModule.config.expressId];
  var settings = app[prodShiftsModule.config.settingsId];
  var userModule = app[prodShiftsModule.config.userId];
  var mongoose = app[prodShiftsModule.config.mongooseId];
  var orgUnitsModule = app[prodShiftsModule.config.orgUnitsId];
  var productionModule = app[prodShiftsModule.config.productionId];
  var ProdShift = mongoose.model('ProdShift');
  var ProdLogEntry = mongoose.model('ProdLogEntry');

  var canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW');
  var canManage = userModule.auth('PROD_DATA:MANAGE');

  express.get('/prodShifts', canView, limitOrgUnit, express.crud.browseRoute.bind(null, app, ProdShift));

  express.post('/prodShifts', canManage, addProdShiftRoute);

  express.get(
    '/prodShifts;export',
    canView,
    limitOrgUnit,
    function overrideFields(req, res, next)
    {
      req.rql.fields = {
        creator: 0,
        createdAt: 0
      };

      next();
    },
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-SHIFTS',
      serializeRow: exportProdShift,
      model: ProdShift
    })
  );

  express.get('/prodShifts/:id', canView, findLatestProdLineShift, express.crud.readRoute.bind(null, app, ProdShift));

  express.put('/prodShifts/:id', canManage, editProdShiftRoute);

  express.delete('/prodShifts/:id', canManage, deleteProdShiftRoute);

  function exportProdShift(doc)
  {
    var subdivision = orgUnitsModule.getByTypeAndId('subdivision', doc.subdivision);
    var prodFlow = orgUnitsModule.getByTypeAndId('prodFlow', doc.prodFlow);

    return {
      'date': moment(doc.date).format('YYYY-MM-DD'),
      'shiftNo': doc.shift,
      'h1': doc.quantitiesDone[0].actual,
      'h2': doc.quantitiesDone[1].actual,
      'h3': doc.quantitiesDone[2].actual,
      'h4': doc.quantitiesDone[3].actual,
      'h5': doc.quantitiesDone[4].actual,
      'h6': doc.quantitiesDone[5].actual,
      'h7': doc.quantitiesDone[6].actual,
      'h8': doc.quantitiesDone[7].actual,
      '"master': doc.master ? doc.master.label : '',
      '"leader': doc.leader ? doc.leader.label : '',
      '"operator': doc.operator ? doc.operator.label : '',
      '"division': doc.division,
      '"subdivision': subdivision ? subdivision.name : doc.subdivision,
      '"mrp': doc.mrpControllers.join(','),
      '"prodFlow': prodFlow ? prodFlow.name : doc.prodFlow,
      '"workCenter': doc.workCenter,
      '"prodLine': doc.prodLine,
      '"shiftId': doc._id
    };
  }

  function findLatestProdLineShift(req, res, next)
  {
    if (/^[0-9a-z-]{15,}$/.test(req.params.id))
    {
      return next();
    }

    step(
      function findDataStep()
      {
        settings.findById('factoryLayout.extendedDowntimeDelay', this.parallel());

        var conditions = {
          date: {
            $gt: moment().subtract(2, 'days')
          },
          prodLine: req.params.id
        };

        ProdShift.find(conditions).sort({date: -1}).limit(1).lean().exec(this.parallel());
      },
      function sendResultStep(err, extendedDowntimeDelay, prodShifts)
      {
        if (err)
        {
          return next(err);
        }

        var result = prodShifts.length ? prodShifts[0] : {
          _id: '?',
          prodLine: req.params.id
        };

        result.extendedDowntimeDelay = extendedDowntimeDelay ? extendedDowntimeDelay.value : 10;

        return res.json(result);
      }
    );
  }

  function addProdShiftRoute(req, res, next)
  {
    step(
      function validateInputStep()
      {
        req.body.shift = parseInt(req.body.shift, 10);

        var dateMoment = moment(req.body.date);

        app.orgUnits.getAllForProdLine(req.body.prodLine, req.body);

        if (!dateMoment.isValid()
          || req.body.shift < 1
          || req.body.shift > 3
          || req.body.division === null)
        {
          return this.skip(new Error('INPUT'), 400);
        }

        dateMoment.hours(req.body.shift === 1 ? 6 : req.body.shift === 2 ? 14 : 22);

        if (Date.now() <= dateMoment.clone().add(8, 'hours').valueOf())
        {
          return this.skip(new Error('SHIFT_NOT_ENDED'), 400);
        }

        req.body.date = dateMoment.toDate();
      },
      function findExistingProdShiftsStep()
      {
        ProdShift
          .find({date: req.body.date, prodLine: req.body.prodLine}, {_id: 1})
          .lean()
          .exec(this.next());
      },
      function handleExistingProdShiftsStep(err, prodShifts)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (prodShifts.length !== 0)
        {
          return this.skip(new Error('EXISTING'), 400);
        }
      },
      function createLogEntryStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        var logEntry = ProdLogEntry.addShift(
          userModule.createUserInfo(req.session.user, req), req.body
        );

        if (!logEntry)
        {
          return this.skip(new Error('INPUT'), 400);
        }

        logEntry.save(this.next());
      },
      function handleLogEntryStep(err, logEntry)
      {
        if (err)
        {
          return this.skip(err);
        }

        var next = this.next();

        logEntryHandlers.addShift(
          app,
          productionModule,
          orgUnitsModule.getByTypeAndId('prodLine', logEntry.prodLine),
          logEntry,
          function(err)
          {
            if (err)
            {
              return next(err, null, null);
            }

            return next(null, null, logEntry);
          }
        );
      },
      function sendResponseStep(err, statusCode, logEntry)
      {
        if (statusCode)
        {
          res.statusCode = statusCode;
        }

        if (err)
        {
          return next(err);
        }

        if (statusCode)
        {
          return res.sendStatus(statusCode);
        }

        res.send(logEntry.data);
      }
    );
  }

  function editProdShiftRoute(req, res, next)
  {
    step(
      function getProdDataStep()
      {
        productionModule.getProdData('shift', req.params.id, this.next());
      },
      function createLogEntryStep(err, prodShift)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodShift)
        {
          return this.skip(null, 404);
        }

        if (!prodShift.hasEnded())
        {
          return this.skip(new Error('SHIFT_NOT_ENDED'), 400);
        }

        var logEntry = ProdLogEntry.editShift(
          prodShift, userModule.createUserInfo(req.session.user, req), req.body
        );

        if (!logEntry)
        {
          return this.skip(new Error('INVALID_CHANGES'), 400);
        }

        logEntry.save(this.next());
      },
      function handleLogEntryStep(err, logEntry)
      {
        if (err)
        {
          return this.skip(err);
        }

        var next = this.next();

        logEntryHandlers.editShift(
          app,
          productionModule,
          orgUnitsModule.getByTypeAndId('prodLine', logEntry.prodLine),
          logEntry,
          function(err)
          {
            if (err)
            {
              return next(err, null, null);
            }

            return next(null, null, logEntry);
          }
        );
      },
      function sendResponseStep(err, statusCode, logEntry)
      {
        if (statusCode)
        {
          res.statusCode = statusCode;
        }

        if (err)
        {
          return next(err);
        }

        if (statusCode)
        {
          return res.sendStatus(statusCode);
        }

        res.send(logEntry.data);

        if (!productionModule.recreating)
        {
          app.broker.publish('production.edited.shift.' + logEntry.prodShift, logEntry.data);
        }
      }
    );
  }

  function deleteProdShiftRoute(req, res, next)
  {
    step(
      function getProdDataStep()
      {
        productionModule.getProdData('shift', req.params.id, this.next());
      },
      function createLogEntryStep(err, prodShift)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodShift)
        {
          return this.skip(null, 404);
        }

        if (!prodShift.isEditable())
        {
          return this.skip(new Error('SHIFT_NOT_EDITABLE'), 400);
        }

        var logEntry = ProdLogEntry.deleteShift(
          prodShift, userModule.createUserInfo(req.session.user, req)
        );

        logEntry.save(this.next());
      },
      function handleLogEntryStep(err, logEntry)
      {
        if (err)
        {
          return this.skip(err);
        }

        var next = this.next();

        logEntryHandlers.deleteShift(
          app,
          productionModule,
          orgUnitsModule.getByTypeAndId('prodLine', logEntry.prodLine),
          logEntry,
          function(err)
          {
            if (err)
            {
              return next(err, null, null);
            }

            return next(null, null, logEntry);
          }
        );
      },
      function sendResponseStep(err, statusCode, logEntry)
      {
        if (statusCode)
        {
          res.statusCode = statusCode;
        }

        if (err)
        {
          return next(err);
        }

        if (statusCode)
        {
          return res.sendStatus(statusCode);
        }

        res.send(logEntry.data);
      }
    );
  }
};
