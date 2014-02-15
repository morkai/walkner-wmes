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

  express.get('/prodShiftOrders;export', canView, limitOrgUnit, exportRoute);

  function exportRoute(req, res, next)
  {
    var queryOptions = mongoSerializer.fromQuery(req.rql);
    var queryStream = ProdShiftOrder.find(queryOptions.selector).sort('startedAt').lean().stream();

    res.attachment('ProdShiftOrders.csv');
    res.write(EXPORT_COLUMNS + '\r\n');

    queryStream.on('error', next);
    queryStream.on('close', function() { res.end(); });
    queryStream.on('data', function(pso)
    {
      if (!pso.finishedAt || !pso.orderData)
      {
        return;
      }

      var orderData = pso.orderData;

      if (!orderData.operations || !orderData.operations[pso.operationNo])
      {
        return;
      }

      var operation = orderData.operations[pso.operationNo];

      if (operation.laborTime === -1)
      {
        return;
      }

      var startedAt = moment(pso.startedAt);

      if (startedAt.isBefore('2013-01-01'))
      {
        return;
      }

      var finishedAt = moment(pso.finishedAt);
      var duration = Math.round(finishedAt.diff(startedAt, 'ms') / 3600000 * 1000) / 1000;

      if (duration < 0)
      {
        return;
      }

      var subdivision = subdivisionsModule.modelsById[pso.subdivision];
      var prodFlow = prodFlowsModule.modelsById[pso.prodFlow];

      res.write([
        quote(pso.mechOrder ? '' : pso.orderId),
        quote(pso.mechOrder ? pso.orderId : orderData.nc12),
        quote(pso.operationNo),
        startedAt.format('YYYY-MM-DD HH:mm:ss'),
        finishedAt.format('YYYY-MM-DD HH:mm:ss'),
        duration.toFixed(3).replace('.', ','),
        pso.quantityDone,
        pso.workerCount,
        operation.laborTime.toFixed(3).replace('.', ','),
        quote(pso.division),
        quote(subdivision ? subdivision.name : pso.subdivision),
        quote(pso.mrpControllers.join(',')),
        quote(prodFlow ? prodFlow.name : pso.prodFlow),
        quote(pso.workCenter),
        quote(pso.prodLine)
      ].join(';') + '\r\n');
    });
  }

  function quote(str)
  {
    return '"' + str + '"';
  }
};
