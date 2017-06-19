// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');

module.exports = function setUpNoOperationsFix(app, psoModule)
{
  var fte = app[psoModule.config.fteId];
  var mongoose = app[psoModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');

  app.broker.subscribe('shiftChanged', function()
  {
    setTimeout(fixNoOperations, 5 * 60 * 1000);
  });

  app.broker.subscribe('app.started', fixNoOperations);

  function fixNoOperations()
  {
    step(
      function findProdShiftOrdersStep()
      {
        var conditions = {
          startedAt: {
            $gt: moment(fte.currentShift.date.getTime()).subtract(7, 'days').toDate(),
            $lt: fte.currentShift.date
          },
          'orderData.operations': {}
        };

        ProdShiftOrder.find(conditions).exec(this.next());
      },
      function findOrdersStep(err, prodShiftOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (prodShiftOrders.length === 0)
        {
          return this.skip();
        }

        var orderIdToProdShiftOrders = {};

        _.forEach(prodShiftOrders, function(pso)
        {
          if (!orderIdToProdShiftOrders[pso.orderId])
          {
            orderIdToProdShiftOrders[pso.orderId] = [pso];
          }
          else
          {
            orderIdToProdShiftOrders[pso.orderId].push(pso);
          }
        });

        var orderIds = Object.keys(orderIdToProdShiftOrders);

        Order.find({_id: {$in: orderIds}}, {operations: 1}).lean().exec(this.next());

        this.orderIdToProdShiftOrders = orderIdToProdShiftOrders;
      },
      function updateOperationsStep(err, orders)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (orders.length === 0)
        {
          return this.skip();
        }

        for (var orderI = 0; orderI < orders.length; ++orderI)
        {
          var order = orders[orderI];
          var operationList = order.operations;

          if (!_.isArray(operationList))
          {
            continue;
          }

          var operationMap = {};
          var prodShiftOrders = this.orderIdToProdShiftOrders[order._id];

          for (var operI = 0; operI < order.operations.length; ++operI)
          {
            var operation = order.operations[operI];

            operationMap[operation.no] = operation;
          }

          for (var psoI = 0; psoI < prodShiftOrders.length; ++psoI)
          {
            var prodShiftOrder = prodShiftOrders[psoI];

            prodShiftOrder.orderData.operations = operationMap;
            prodShiftOrder.markModified('orderData');
            prodShiftOrder.save(this.group());
          }
        }
      },
      function finalizeStep(err, groups)
      {
        if (err)
        {
          psoModule.error("Failed to fix orders without operations: %s", err.message);
        }
        else if (groups)
        {
          psoModule.debug("Fixed %d orders without operations :)", groups.length);
        }

        this.orderIdToProdShiftOrders = null;

        setTimeout(fixNoOperations, 8 * 3600 * 1000);
      }
    );
  }
};
