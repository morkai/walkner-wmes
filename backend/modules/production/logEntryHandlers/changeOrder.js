'use strict';

var lodash = require('lodash');
var orderFinder = require('../orderFinder');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var MechOrder = mongoose.model('MechOrder');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');

  if (!logEntry.data.creator)
  {
    logEntry.data.creator = logEntry.creator;
  }

  if (isOfflineEntry())
  {
    fillOrderData();
  }
  else
  {
    createProdShiftOrder();
  }

  function isOfflineEntry()
  {
    var orderData = logEntry.data.orderData;

    return !orderData
      || !orderData.operations
      || typeof orderData.operations !== 'object'
      || Array.isArray(orderData.operations)
      || lodash.isEmpty(orderData.operations);
  }

  function fillOrderData()
  {
    if (logEntry.data.mechOrder)
    {
      fillMechOrderData();
    }
    else
    {
      fillProdOrderData();
    }
  }

  function fillMechOrderData()
  {
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

        return createProdShiftOrder();
      }

      var orderData = prepareOperations(mechOrders[0]);

      orderData.nc12 = orderData._id;
      orderData.no = null;

      delete orderData._id;

      logEntry.data.orderData = orderData;

      return createProdShiftOrder();
    });
  }

  function fillProdOrderData()
  {
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

        return createProdShiftOrder();
      }

      var orderData = prepareOperations(orders[0]);

      orderData.no = orderData._id;

      delete orderData._id;

      logEntry.data.orderData = orderData;

      return createProdShiftOrder();
    });
  }

  function createProdShiftOrder()
  {
    var prodShiftOrder = new ProdShiftOrder(logEntry.data);

    prodShiftOrder.save(function(err)
    {
      if (err && err.code !== 11000)
      {
        productionModule.error(
          "Failed to save a new prod shift order (LOG=[%s]): %s", logEntry._id, err.stack
        );

        return done(err);
      }

      if (!err)
      {
        productionModule.setProdData(prodShiftOrder);
      }

      prodLine.set({
        prodShiftOrder: prodShiftOrder.get('_id'),
        prodDowntime: null
      });

      prodLine.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save the prod line after changing the prod shift order (LOG=[%s]): %s",
            logEntry._id,
            err.stack
          );
        }

        return done(err);
      });
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
};
