// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var moment = require('moment');
var userInfo = require('../../models/userInfo');
var crud = require('../express/crud');
var limitOrgUnit = require('../prodLines/limitOrgUnit');
var logEntryHandlers = require('../production/logEntryHandlers');

module.exports = function setUpProdShiftsRoutes(app, prodShiftsModule)
{
  var express = app[prodShiftsModule.config.expressId];
  var userModule = app[prodShiftsModule.config.userId];
  var mongoose = app[prodShiftsModule.config.mongooseId];
  var orgUnitsModule = app[prodShiftsModule.config.orgUnitsId];
  var productionModule = app[prodShiftsModule.config.productionId];
  var ProdShift = mongoose.model('ProdShift');
  var ProdLogEntry = mongoose.model('ProdLogEntry');

  var canView = userModule.auth('PROD_DATA:VIEW');
  var canManage = userModule.auth('PROD_DATA:MANAGE');

  express.get('/prodShifts', canView, limitOrgUnit, crud.browseRoute.bind(null, app, ProdShift));

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
    crud.exportRoute.bind(null, {
      filename: 'WMES-SHIFTS',
      serializeRow: exportProdShift,
      model: ProdShift
    })
  );

  express.get('/prodShifts/:id', canView, crud.readRoute.bind(null, app, ProdShift));

  express.put('/prodShifts/:id', canManage, editProdShiftRoute);

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
          prodShift, userInfo.createObject(req.session.user, req), req.body
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
          return res.send(statusCode);
        }

        res.send(logEntry.data);

        if (!productionModule.recreating)
        {
          app.broker.publish('production.edited.shift.' + logEntry.prodShift, logEntry.data);
        }
      }
    );
  }
};
