'use strict';

var moment = require('moment');
var mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');
var crud = require('../express/crud');
var limitOrgUnit = require('../prodLines/limitOrgUnit');

module.exports = function setUpProdShiftOrdersRoutes(app, prodShiftOrdersModule)
{
  var express = app[prodShiftOrdersModule.config.expressId];
  var userModule = app[prodShiftOrdersModule.config.userId];
  var mongoose = app[prodShiftOrdersModule.config.mongooseId];
  var subdivisionsModule = app[prodShiftOrdersModule.config.subdivisionsId];
  var prodFlowsModule = app[prodShiftOrdersModule.config.prodFlowsId];
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');

  var EXPORT_COLUMNS = [
    'OrderNo',
    '12NC',
    'OperationNo',
    'StartedAt',
    'FinishedAt',
    'Duration',
    'QuantityDone',
    'WorkerCount',
    'LaborTime',
    'Division',
    'Subdivision',
    'MRPControllers',
    'ProdFlow',
    'WorkCenter',
    'ProdLine'
  ].join(';');

  var canView = userModule.auth('PROD_DATA:VIEW');

  express.get(
    '/prodShiftOrders', canView, limitOrgUnit, crud.browseRoute.bind(null, app, ProdShiftOrder)
  );

  express.get('/prodShiftOrders/:id', canView, crud.readRoute.bind(null, app, ProdShiftOrder));

  express.get(
    '/prodShiftOrders;export',
    canView,
    limitOrgUnit,
    crud.exportRoute.bind(null, 'WMES-ORDERS', exportProdShiftOrder, ProdShiftOrder)
  );

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

    var startedAt = moment(doc.startedAt);

    if (startedAt.isBefore('2013-01-01'))
    {
      return;
    }

    var finishedAt = moment(doc.finishedAt);
    var duration = Math.round(finishedAt.diff(startedAt, 'ms') / 3600000 * 1000) / 1000;

    if (duration < 0)
    {
      return;
    }

    var operation = orderData.operations[doc.operationNo];
    var subdivision = subdivisionsModule.modelsById[doc.subdivision];
    var prodFlow = prodFlowsModule.modelsById[doc.prodFlow];

    return {
      '"orderNo': doc.mechOrder ? '' : doc.orderId,
      '"12nc': doc.mechOrder ? doc.orderId : orderData.nc12,
      '"operationNo': doc.operationNo,
      'startedAt': startedAt.format('YYYY-MM-DD HH:mm:ss'),
      'finishedAt': finishedAt.format('YYYY-MM-DD HH:mm:ss'),
      '#duration': duration,
      '#quantityDone': doc.quantityDone,
      '#workerCount': doc.workerCount,
      '#laborTime': operation.laborTime === -1 ? 0 : operation.laborTime,
      '#machineTime': operation.machineTime === -1 ? 0 : operation.machineTime,
      '"orderMrp': orderData.mrp || '',
      '"operationWorkCenter': operation.workCenter || '',
      '"division': doc.division,
      '"subdivision': subdivision ? subdivision.name : doc.subdivision,
      '"mrp': doc.mrpControllers.join(','),
      '"prodFlow': prodFlow ? prodFlow.name : doc.prodFlow,
      '"workCenter': doc.workCenter,
      '"prodLine': doc.prodLine
    };
  }
};
