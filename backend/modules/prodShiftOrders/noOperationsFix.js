// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function setUpNoOperationsFix(app, psoModule)
{
  const fte = app[psoModule.config.fteId];
  const mongoose = app[psoModule.config.mongooseId];
  const Order = mongoose.model('Order');
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');

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
        const conditions = {
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

        const orderIdToProdShiftOrders = {};

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

        const orderIds = Object.keys(orderIdToProdShiftOrders);

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

        for (let orderI = 0; orderI < orders.length; ++orderI)
        {
          const order = orders[orderI];
          const operationList = order.operations;

          if (!_.isArray(operationList))
          {
            continue;
          }

          const operationMap = {};
          const prodShiftOrders = this.orderIdToProdShiftOrders[order._id];

          for (let operI = 0; operI < order.operations.length; ++operI)
          {
            const operation = order.operations[operI];

            operationMap[operation.no] = operation;
          }

          for (let psoI = 0; psoI < prodShiftOrders.length; ++psoI)
          {
            const prodShiftOrder = prodShiftOrders[psoI];

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
          psoModule.error('Failed to fix orders without operations: %s', err.message);
        }
        else if (groups)
        {
          psoModule.debug('Fixed %d orders without operations :)', groups.length);
        }

        this.orderIdToProdShiftOrders = null;

        setTimeout(fixNoOperations, 8 * 3600 * 1000);
      }
    );
  }
};
