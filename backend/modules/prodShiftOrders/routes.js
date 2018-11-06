// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProdShiftOrdersRoutes(app, psoModule)
{
  const express = app[psoModule.config.expressId];
  const userModule = app[psoModule.config.userId];
  const mongoose = app[psoModule.config.mongooseId];
  const orgUnitsModule = app[psoModule.config.orgUnitsId];
  const productionModule = app[psoModule.config.productionId];
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');

  const canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW', 'PLANNING:VIEW');
  const canManage = userModule.auth(
    'PROD_DATA:MANAGE',
    'PROD_DATA:CHANGES:REQUEST',
    'PROD_DATA:CHANGES:MANAGE'
  );

  express.get('/prodShiftOrders', canView, express.crud.browseRoute.bind(null, app, ProdShiftOrder));

  express.post('/prodShiftOrders', canManage, addProdShiftOrderRoute);

  express.get(
    '/prodShiftOrders;export.:format?',
    canView,
    function(req, res, next)
    {
      req.rql.fields = {
        creator: 0,
        losses: 0,
        'orderData.bom': 0,
        'orderData.documents': 0
      };
      req.rql.sort = {};

      return next();
    },
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-ORDERS',
      freezeRows: 1,
      freezeColumns: 2,
      columns: {
        orderNo: {width: 9, position: 10},
        nc12: {width: 12, position: 20},
        orderDescription: {width: 35, position: 30},
        orderMrp: {width: 5, position: 40},
        startedAt: {type: 'datetime', position: 40},
        efficiency: {type: 'percent', position: 50},
        operationNo: 4,
        date: 'date',
        shift: {
          type: 'integer',
          width: 5
        },
        finishedAt: 'datetime',
        totalDuration: 'decimal',
        breakDuration: 'decimal',
        downtimeDuration: 'decimal',
        workDuration: 'decimal',
        quantityTodo: 'integer',
        totalQuantity: 'integer',
        quantityDone: 'integer',
        quantityLost: 'integer',
        workerCount: 'integer',
        laborTime: 'decimal',
        machineTime: 'decimal'
      },
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

    const orderData = doc.orderData;

    if (!orderData.operations || !orderData.operations[doc.operationNo])
    {
      return;
    }

    const operation = orderData.operations[doc.operationNo];
    const subdivision = orgUnitsModule.getByTypeAndId('subdivision', doc.subdivision);
    const prodFlow = orgUnitsModule.getByTypeAndId('prodFlow', doc.prodFlow);
    const efficiency = (doc.laborTime / 100 * doc.totalQuantity) / (doc.workDuration * doc.workerCount);

    return {
      orderNo: doc.mechOrder ? '' : doc.orderId,
      nc12: doc.mechOrder ? doc.orderId : orderData.nc12,
      operationNo: doc.operationNo,
      date: doc.date,
      shift: doc.shift,
      startedAt: doc.startedAt,
      finishedAt: doc.finishedAt,
      totalDuration: doc.totalDuration,
      breakDuration: doc.breakDuration,
      downtimeDuration: doc.downtimeDuration,
      workDuration: doc.workDuration,
      quantityTodo: doc.orderData && doc.orderData.qty || 0,
      totalQuantity: doc.totalQuantity,
      quantityDone: doc.quantityDone,
      quantityLost: doc.quantityLost,
      workerCount: doc.workerCount,
      laborTime: operation.laborTime === -1 ? null : operation.laborTime,
      machineTime: operation.machineTime === -1 ? null : operation.machineTime,
      efficiency: isNaN(efficiency) || !isFinite(efficiency) ? null : efficiency,
      orderMrp: orderData.mrp || '',
      orderName: (orderData.name || '').trim(),
      orderDescription: (orderData.description || '').trim(),
      operationName: (operation.name || '').trim(),
      operationWorkCenter: operation.workCenter || '',
      prodLine: doc.prodLine,
      division: doc.division,
      subdivision: subdivision ? subdivision.name : doc.subdivision,
      mrp: Array.isArray(doc.mrpControllers) ? doc.mrpControllers.join(',') : [],
      prodFlow: prodFlow ? prodFlow.name : doc.prodFlow,
      workCenter: doc.workCenter,
      master: exportUserInfo(doc.master),
      leader: exportUserInfo(doc.leader),
      operator: exportUserInfo(doc.operator),
      operators: Array.isArray(doc.operators) ? doc.operators.map(exportUserInfo).join(';') : '',
      orderId: doc._id,
      shiftId: doc.prodShift || ''
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
    const user = req.session.user;
    const userInfo = userModule.createUserInfo(user, req);

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
    const user = req.session.user;
    const userInfo = userModule.createUserInfo(user, req);

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
    const user = req.session.user;
    const userInfo = userModule.createUserInfo(user, req);

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
