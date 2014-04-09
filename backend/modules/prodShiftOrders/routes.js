'use strict';

var step = require('h5.step');
var moment = require('moment');
var crud = require('../express/crud');
var limitOrgUnit = require('../prodLines/limitOrgUnit');
var userInfo = require('../../models/userInfo');
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

  var canView = userModule.auth('PROD_DATA:VIEW');
  var canManage = userModule.auth('PROD_DATA:MANAGE');

  express.get(
    '/prodShiftOrders', canView, limitOrgUnit, crud.browseRoute.bind(null, app, ProdShiftOrder)
  );

  express.get(
    '/prodShiftOrders;export',
    canView,
    limitOrgUnit,
    crud.exportRoute.bind(null, {
      filename: 'WMES-ORDERS',
      serializeRow: exportProdShiftOrder,
      model: ProdShiftOrder
    })
  );

  express.get('/prodShiftOrders/:id', canView, crud.readRoute.bind(null, app, ProdShiftOrder));

  express.put('/prodShiftOrders/:id', canManage, editProdShiftOrderRoute);

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
      'startedAt': moment(startedAt).format('YYYY-MM-DD HH:mm:ss'),
      'finishedAt': moment(finishedAt).format('YYYY-MM-DD HH:mm:ss'),
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
          prodShiftOrder, userInfo.createObject(req.session.user, req), req.body
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
          return res.send(statusCode);
        }

        res.send(logEntry.data);

        if (!productionModule.recreating)
        {
          app.broker.publish('production.edited.order.' + logEntry.prodShiftOrder, logEntry.data);
        }
      }
    );
  }
};
