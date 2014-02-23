'use strict';

var lodash = require('lodash');
var orderFinder = require('../orderFinder');

exports.isOfflineEntry = function(logEntry)
{
  var orderData = logEntry.data.orderData;

  return !orderData
    || !orderData.operations
    || typeof orderData.operations !== 'object'
    || Array.isArray(orderData.operations)
    || lodash.isEmpty(orderData.operations);
};

exports.fillOrderData = function(app, productionModule, logEntry, done)
{
  if (logEntry.data.mechOrder)
  {
    fillMechOrderData(app, productionModule, logEntry, done);
  }
  else
  {
    fillProdOrderData(app, productionModule, logEntry, done);
  }
};

exports.getLaborTime = function(prodShiftOrder)
{
  if (!prodShiftOrder || !prodShiftOrder.operationNo || !prodShiftOrder.orderData)
  {
    console.log('1 :(');
    return 0;
  }

  var operations = prodShiftOrder.orderData.operations;

  if (!operations)
  {
    return 0;
  }

  var operation = operations[prodShiftOrder.operationNo];

  if (!operation || typeof operation.laborTime !== 'number' || operation.laborTime === -1)
  {
    return 0;
  }

  return operation.laborTime;
};

function fillMechOrderData(app, productionModule, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var MechOrder = mongoose.model('MechOrder');

  orderFinder.findOrdersByNc12(Order, MechOrder, logEntry.data.orderId, function(err, mechOrders)
  {
    if (err)
    {
      productionModule.error(
        "Failed to find mech orders to fill order data (LOG=[%s]): %s",
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (mechOrders.length === 0)
    {
      productionModule.warn(
        "Couldn't find mech order by nc12=[%s] (LOG=[%s])",
        logEntry.data.orderId,
        logEntry._id
      );

      return done();
    }

    var orderData = prepareOperations(mechOrders[0]);

    orderData.nc12 = orderData._id;
    orderData.no = null;

    delete orderData._id;

    logEntry.data.orderData = orderData;

    return done();
  });
}

function fillProdOrderData(app, productionModule, logEntry, done)
{
  var Order = app[productionModule.config.mongooseId].model('Order');

  orderFinder.findOrdersByNo(Order, logEntry.data.orderId, function(err, orders)
  {
    if (err)
    {
      productionModule.error(
        "Failed to find prod orders to fill order data (LOG=[%s]): %s",
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (orders.length === 0)
    {
      productionModule.warn(
        "Couldn't find a prod order by no=[%s] (LOG=[%s])",
        logEntry.data.orderId,
        logEntry._id
      );

      return done();
    }

    var orderData = prepareOperations(orders[0]);

    orderData.no = orderData._id;

    delete orderData._id;

    logEntry.data.orderData = orderData;

    return done();
  });
}

function prepareOperations(orderData)
{
  if (Array.isArray(orderData.operations))
  {
    var operations = {};

    orderData.operations.forEach(function(operation)
    {
      operations[operation.no] = operation;
    });

    orderData.operations = operations;
  }
  else if (!lodash.isObject(orderData.operations))
  {
    orderData.operations = {};
  }

  return orderData;
}
