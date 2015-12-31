// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var orderFinder = require('../orderFinder');

exports.isOfflineEntry = function(logEntry)
{
  var orderData = logEntry.data.orderData;

  return !orderData
    || !orderData.operations
    || typeof orderData.operations !== 'object'
    || Array.isArray(orderData.operations)
    || _.isEmpty(orderData.operations);
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

exports.createRecalcShiftTimesStep = function(productionModule, logEntry)
{
  return function recalcShiftTimesStep(err)
  {
    if (err)
    {
      return this.skip(err);
    }

    step(
      function findProdShiftStep()
      {
        productionModule.getProdData('shift', logEntry.prodShift, this.next());
      },
      function recalcProdShiftStep(err, prodShift)
      {
        if (err)
        {
          productionModule.error("Failed to find prod shift to recalc [%s]: %s", logEntry.prodShift, err.message);
        }

        if (prodShift)
        {
          prodShift.recalcTimes(this.next());
        }
      },
      function handleErrorStep(err)
      {
        if (err)
        {
          productionModule.error("Failed to recalc prod shift [%s]: %s", logEntry.prodShift, err.message);
        }
      },
      this.next()
    );
  };
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

    _.forEach(orderData.operations, function(operation)
    {
      if (operation.workCenter !== '' && operation.laborTime !== -1)
      {
        operations[operation.no] = operation;
      }
    });

    orderData.operations = operations;
  }
  else if (!_.isObject(orderData.operations))
  {
    orderData.operations = {};
  }

  return orderData;
}
