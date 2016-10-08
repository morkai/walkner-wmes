// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var limitOrgUnit = require('../prodLines/limitOrgUnit');

module.exports = function setUpProdShiftOrdersRoutes(app, psoModule)
{
  var express = app[psoModule.config.expressId];
  var userModule = app[psoModule.config.userId];
  var mongoose = app[psoModule.config.mongooseId];
  var orgUnitsModule = app[psoModule.config.orgUnitsId];
  var productionModule = app[psoModule.config.productionId];
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');

  var canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW');
  var canManage = userModule.auth(
    'PROD_DATA:MANAGE',
    'PROD_DATA:CHANGES:REQUEST',
    'PROD_DATA:CHANGES:MANAGE'
  );

  express.get('/prodShiftOrders', canView, limitOrgUnit, express.crud.browseRoute.bind(null, app, ProdShiftOrder));

  express.post('/prodShiftOrders', canManage, addProdShiftOrderRoute);

  express.get(
    '/prodShiftOrders;export',
    canView,
    limitOrgUnit,
    function(req, res, next)
    {
      req.rql.sort = {};

      return next();
    },
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
      '"orderDescription': (orderData.description || '').trim(),
      '"operationName': (operation.name || '').trim(),
      '"operationWorkCenter': operation.workCenter || '',
      '"division': doc.division,
      '"subdivision': subdivision ? subdivision.name : doc.subdivision,
      '"mrp': Array.isArray(doc.mrpControllers) ? doc.mrpControllers.join(',') : [],
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
    var user = req.session.user;
    var userInfo = userModule.createUserInfo(user, req);

    psoModule.addProdShiftOrder(user, userInfo, req.body, function(err, statusCode, logEntry)
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

  function editProdShiftOrderRoute(req, res, next)
  {
    var user = req.session.user;
    var userInfo = userModule.createUserInfo(user, req);

    psoModule.editProdShiftOrder(user, userInfo, req.params.id, req.body, function(err, statusCode, logEntry)
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
    });
  }

  function deleteProdShiftOrderRoute(req, res, next)
  {
    var user = req.session.user;
    var userInfo = userModule.createUserInfo(user, req);

    psoModule.deleteProdShiftOrder(user, userInfo, req.params.id, req.body, function(err, statusCode, logEntry)
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
