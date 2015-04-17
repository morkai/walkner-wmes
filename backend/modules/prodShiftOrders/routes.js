// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var limitOrgUnit = require('../prodLines/limitOrgUnit');
var logEntryHandlers = require('../production/logEntryHandlers');

module.exports = function setUpProdShiftOrdersRoutes(app, prodShiftOrdersModule)
{
  var express = app[prodShiftOrdersModule.config.expressId];
  var userModule = app[prodShiftOrdersModule.config.userId];
  var mongoose = app[prodShiftOrdersModule.config.mongooseId];
  var orgUnitsModule = app[prodShiftOrdersModule.config.orgUnitsId];
  var productionModule = app[prodShiftOrdersModule.config.productionId];
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdLogEntry = mongoose.model('ProdLogEntry');

  var canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW');
  var canManage = userModule.auth('PROD_DATA:MANAGE');

  express.get('/prodShiftOrders', canView, limitOrgUnit, express.crud.browseRoute.bind(null, app, ProdShiftOrder));

  express.post('/prodShiftOrders', canManage, addProdShiftOrderRoute);

  express.get(
    '/prodShiftOrders;export',
    canView,
    limitOrgUnit,
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-ORDERS',
      serializeRow: exportProdShiftOrder,
      model: ProdShiftOrder
    })
  );

  express.get('/prodShiftOrders/:id', canView, express.crud.readRoute.bind(null, app, ProdShiftOrder));

  express.put('/prodShiftOrders/:id', canManage, editProdShiftOrderRoute);

  express.delete('/prodShiftOrders/:id', canManage, deleteProdShiftOrderRoute);

  function exportProdShiftOrder(doc)
  {
    if (!doc.finishedAt || !doc.orderData)
    {
      return;
    }

    var orderData = doc.orderData;

    if (!orderData.operations || !orderData.operations[doc.operationNo])
    {
      return;
    }

    var operation = orderData.operations[doc.operationNo];
    var subdivision = orgUnitsModule.getByTypeAndId('subdivision', doc.subdivision);
    var prodFlow = orgUnitsModule.getByTypeAndId('prodFlow', doc.prodFlow);

    return {
      '"orderNo': doc.mechOrder ? '' : doc.orderId,
      '"12nc': doc.mechOrder ? doc.orderId : orderData.nc12,
      '"operationNo': doc.operationNo,
      'startedAt': app.formatDateTime(doc.startedAt),
      'finishedAt': app.formatDateTime(doc.finishedAt),
      '#totalDuration': doc.totalDuration,
      '#breakDuration': doc.breakDuration,
      '#downtimeDuration': doc.downtimeDuration,
      '#workDuration': doc.workDuration,
      '#totalQuantity': doc.totalQuantity,
      '#quantityDone': doc.quantityDone,
      '#quantityLost': doc.quantityLost,
      '#workerCount': doc.workerCount,
      '#laborTime': operation.laborTime === -1 ? 0 : operation.laborTime,
      '#machineTime': operation.machineTime === -1 ? 0 : operation.machineTime,
      '"master': exportUserInfo(doc.master),
      '"leader': exportUserInfo(doc.leader),
      '"operator': exportUserInfo(doc.operator),
      '"operators': Array.isArray(doc.operators) ? doc.operators.map(exportUserInfo).join(';') : '',
      '"orderMrp': orderData.mrp || '',
      '"orderName': (orderData.name || '').trim(),
      '"operationName': (operation.name || '').trim(),
      '"operationWorkCenter': operation.workCenter || '',
      '"division': doc.division,
      '"subdivision': subdivision ? subdivision.name : doc.subdivision,
      '"mrp': doc.mrpControllers.join(','),
      '"prodFlow': prodFlow ? prodFlow.name : doc.prodFlow,
      '"workCenter': doc.workCenter,
      '"prodLine': doc.prodLine,
      '"orderId': doc._id,
      '"shiftId': doc.prodShift || ''
    };
  }

  function exportUserInfo(userInfo)
  {
    if (!userInfo)
    {
      return '';
    }

    if (userInfo.label)
    {
      return userInfo.label;
    }

    if (userInfo.id)
    {
      return userInfo.id;
    }

    return '?';
  }

  function addProdShiftOrderRoute(req, res, next)
  {
    step(
      function getProdShiftStep()
      {
        productionModule.getProdData('shift', req.body.prodShift, this.next());
      },
      function createLogEntryStep(err, prodShift)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodShift)
        {
          return this.skip(new Error('INPUT'), 400);
        }

        _.forEach([
          'date', 'shift',
          'division', 'subdivision', 'mrpControllers', 'prodFlow', 'workCenter', 'prodLine'
        ], function(property)
        {
          req.body[property] = prodShift[property];
        });

        var logEntry = ProdLogEntry.addOrder(
          userModule.createUserInfo(req.session.user, req), req.body
        );

        if (!logEntry)
        {
          return this.skip(new Error('INPUT'), 400);
        }

        var next = this.next();

        validateOverlappingOrders({_id: null, prodShift: logEntry.prodShift}, logEntry.data, function(err)
        {
          if (err)
          {
            return next(err, null);
          }

          logEntry.save(next);
        });
      },
      function handleLogEntryStep(err, logEntry)
      {
        if (err)
        {
          return this.skip(err);
        }

        var next = this.next();

        logEntryHandlers.addOrder(
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

  function editProdShiftOrderRoute(req, res, next)
  {
    step(
      function getProdDataStep()
      {
        productionModule.getProdData('order', req.params.id, this.next());
      },
      function createLogEntryStep(err, prodShiftOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodShiftOrder)
        {
          return this.skip(null, 404);
        }

        if (!prodShiftOrder.isEditable())
        {
          return this.skip(new Error('NOT_EDITABLE'), 400);
        }

        var logEntry = ProdLogEntry.editOrder(
          prodShiftOrder, userModule.createUserInfo(req.session.user, req), req.body
        );

        if (!logEntry)
        {
          return this.skip(new Error('INVALID_CHANGES'), 400);
        }

        var next = this.next();

        validateOverlappingOrders(prodShiftOrder, logEntry.data, function(err)
        {
          if (err)
          {
            return next(err, null);
          }

          logEntry.save(next);
        });
      },
      function handleLogEntryStep(err, logEntry)
      {
        if (err)
        {
          return this.skip(err);
        }

        var next = this.next();

        logEntryHandlers.editOrder(
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
          app.broker.publish('production.edited.order.' + logEntry.prodShiftOrder, logEntry.data);
        }
      }
    );
  }

  function deleteProdShiftOrderRoute(req, res, next)
  {
    step(
      function getProdDataStep()
      {
        productionModule.getProdData('order', req.params.id, this.next());
      },
      function createLogEntryStep(err, prodShiftOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodShiftOrder)
        {
          return this.skip(null, 404);
        }

        if (!prodShiftOrder.isEditable())
        {
          return this.skip(new Error('ORDER_NOT_EDITABLE'), 400);
        }

        var logEntry = ProdLogEntry.deleteOrder(
          prodShiftOrder, userModule.createUserInfo(req.session.user, req)
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

        logEntryHandlers.deleteOrder(
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

  function validateOverlappingOrders(prodShiftOrder, changes, done)
  {
    if (!changes.startedAt && !changes.finishedAt)
    {
      return done(null);
    }

    var conditions = {prodShift: prodShiftOrder.prodShift};
    var fields = {startedAt: 1, finishedAt: 1};

    ProdShiftOrder.find(conditions, fields).lean().exec(function(err, prodShiftOrders)
    {
      if (err)
      {
        return done(err);
      }

      var startedAt = changes.startedAt || prodShiftOrder.startedAt;
      var finishedAt = changes.finishedAt || prodShiftOrder.finishedAt;

      for (var i = 0, l = prodShiftOrders.length; i < l; ++i)
      {
        var pso = prodShiftOrders[i];

        if (pso._id !== prodShiftOrder._id && startedAt < pso.finishedAt && finishedAt > pso.startedAt)
        {
          var psoStartedAt = moment(pso.startedAt).milliseconds(0).valueOf();
          var psoFinishedAt = moment(pso.finishedAt).milliseconds(0).valueOf();
          var newStartedAt = moment(startedAt).milliseconds(0).valueOf();
          var newFinishedAt = moment(startedAt).milliseconds(0).valueOf();

          if (newStartedAt === psoFinishedAt)
          {
            startedAt = new Date(pso.finishedAt.getTime() + 1);
          }

          if (newFinishedAt === psoStartedAt)
          {
            finishedAt = new Date(pso.startedAt.getTime() - 1);
          }

          if (startedAt < pso.finishedAt && finishedAt > pso.startedAt)
          {
            return done(express.createHttpError('OVERLAPPING_ORDERS', 400));
          }

          changes.startedAt = startedAt;
          changes.finishedAt = finishedAt;
        }
      }

      return done(null);
    });
  }
};
