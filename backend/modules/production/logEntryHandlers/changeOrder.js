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
          "Failed to find mech orders to fill order data (prodLogEntry=[%s]): %s",
          logEntry._id,
          err.stack
        );

        return done(err);
      }

      if (mechOrders.length === 0)
      {
        productionModule.warn(
          "Couldn't find mech order by nc12=[%s] (prodLogEntry=[%s]) :(",
          logEntry.data.orderId,
          logEntry._id
        );

        return createProdShiftOrder();
      }

      var orderData = mechOrders[0];

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
          "Failed to find prod orders to fill order data (prodLogEntry=[%s]): %s",
          logEntry._id,
          err.stack
        );

        return done(err);
      }

      if (orders.length === 0)
      {
        productionModule.warn(
          "Couldn't find prod order by no=[%s] (prodLogEntry=[%s]) :(",
          logEntry.data.orderId,
          logEntry._id
        );

        return createProdShiftOrder();
      }

      var orderData = orders[0];

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
          "Failed to save a new prod shift order [%s] for prod line [%s]: %s",
          prodShiftOrder.get('_id'),
          prodLine.get('_id'),
          err.stack
        );

        return done(err);
      }

      productionModule.setProdData(prodShiftOrder);

      prodLine.set({
        prodShiftOrder: prodShiftOrder.get('_id'),
        prodDowntime: null
      });

      prodLine.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to save the prod line [%s] after changing the prod shift order to [%s]: %s",
            prodLine.get('_id'),
            prodShiftOrder.get('_id'),
            err.stack
          );
        }

        return done(err);
      });
    });
  }
};
