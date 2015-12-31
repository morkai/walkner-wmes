// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');
var moment = require('moment');
var limitOrgUnit = require('../prodLines/limitOrgUnit');

module.exports = function setUpProdShiftsRoutes(app, prodShiftsModule)
{
  var express = app[prodShiftsModule.config.expressId];
  var settings = app[prodShiftsModule.config.settingsId];
  var userModule = app[prodShiftsModule.config.userId];
  var mongoose = app[prodShiftsModule.config.mongooseId];
  var orgUnitsModule = app[prodShiftsModule.config.orgUnitsId];
  var productionModule = app[prodShiftsModule.config.productionId];
  var ProdShift = mongoose.model('ProdShift');

  var canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW');
  var canManage = userModule.auth(
    'PROD_DATA:MANAGE',
    'PROD_DATA:CHANGES:REQUEST',
    'PROD_DATA:CHANGES:MANAGE'
  );

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
      req.rql.sort = {};

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
      'date': app.formatDate(doc.date),
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
    var user = req.session.user;
    var userInfo = userModule.createUserInfo(user, req);

    prodShiftsModule.addProdShift(user, userInfo, req.body, function(err, statusCode, logEntry)
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
    });
  }

  function editProdShiftRoute(req, res, next)
  {
    var user = req.session.user;
    var userInfo = userModule.createUserInfo(user, req);

    prodShiftsModule.editProdShift(user, userInfo, req.params.id, req.body, function(err, statusCode, logEntry)
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
    });
  }

  function deleteProdShiftRoute(req, res, next)
  {
    var user = req.session.user;
    var userInfo = userModule.createUserInfo(user, req);

    prodShiftsModule.deleteProdShift(user, userInfo, req.params.id, req.body, function(err, statusCode, logEntry)
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
    });
  }
};
