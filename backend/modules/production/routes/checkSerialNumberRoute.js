// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function checkSerialNumberRoute(app, productionModule, req, res, next)
{
  const orgUnits = app[productionModule.config.orgUnitsId];
  const mongoose = app[productionModule.config.mongooseId];
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const Order = mongoose.model('Order');
  const OrderBomMatcher = mongoose.model('OrderBomMatcher');
  const logEntry = new ProdLogEntry(orgUnits.fix.prodLogEntry(_.assign(req.body, {
    savedAt: new Date(),
    todo: false
  })));

  const orderBomMatcherCache = new Map();

  app.broker.subscribe('ordersBomMatchers.**', () => orderBomMatcherCache.clear());

  app.broker.subscribe('shiftChanged', () => orderBomMatcherCache.clear());

  step(
    function()
    {
      if (logEntry._id)
      {
        return;
      }

      const lineState = productionModule.getProdLineState(logEntry.prodLine);

      if (!lineState)
      {
        return this.skip(null, {
          result: 'INVALID_LINE'
        });
      }

      const hasOrderNo = /^[0-9]+$/.test(logEntry.data.orderNo) && logEntry.data.orderNo !== '000000000';
      const prodShift = lineState.prodShift;
      const currentOrder = lineState.getCurrentOrder();
      const prodShiftOrder = hasOrderNo
        ? lineState.getLastOrderByNo(logEntry.data.orderNo)
        : currentOrder;

      if (!prodShift || !prodShiftOrder)
      {
        return this.skip(null, {
          result: 'INVALID_LINE_STATE'
        });
      }

      if (lineState.state !== 'working' && prodShiftOrder === currentOrder)
      {
        return this.skip(null, {
          result: 'INVALID_STATE:' + lineState.state
        });
      }

      logEntry._id = ProdLogEntry.generateId(logEntry.createdAt, prodShift._id);
      logEntry.division = prodShift.division;
      logEntry.subdivision = prodShift.subdivision;
      logEntry.mrpControllers = prodShift.mrpControllers;
      logEntry.prodFlow = prodShift.prodFlow;
      logEntry.workCenter = prodShift.workCenter;
      logEntry.prodShift = prodShift._id;
      logEntry.prodShiftOrder = prodShiftOrder._id;

      if (!hasOrderNo)
      {
        logEntry.data.orderNo = prodShiftOrder.orderId;
      }

      if (logEntry.data.sapTaktTime < 0)
      {
        logEntry.data.sapTaktTime = prodShiftOrder.sapTaktTime;
      }
    },
    function()
    {
      getOrderBomMatcher(logEntry.data.orderNo, this.next());
    },
    function(err, orderBomMatcher)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!Array.isArray(logEntry.data.bom) && orderBomMatcher)
      {
        return this.skip(null, {
          result: 'CHECK_BOM',
          logEntry,
          components: orderBomMatcher.components
        });
      }
    },
    function()
    {
      productionModule.checkSerialNumber(logEntry, this.next());
    },
    function(err, result)
    {
      if (err)
      {
        return next(err);
      }

      res.json(result);

      if (result.result !== 'SUCCESS' && result.result !== 'CHECK_BOM')
      {
        return;
      }

      logEntry.save(function(err)
      {
        if (err)
        {
          productionModule.error(
            `[checkSerialNumber] Failed to save the log entry [${logEntry._id}]: ${err.message}`
          );
        }
      });
    }
  );

  function getOrderBomMatcher(orderNo, done)
  {
    if (orderBomMatcherCache.has(orderNo))
    {
      return done(null, orderBomMatcherCache.get(orderNo));
    }

    step(
      function()
      {
        const fields = {
          nc12: 1,
          mrp: 1,
          name: 1,
          description: 1,
          'bom.nc12': 1
        };

        Order
          .findById(orderNo, fields)
          .lean()
          .exec(this.next());
      },
      function(err, order)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!order)
        {
          return this.skip(app.createError('ORDER_NOT_FOUND', 400));
        }

        setImmediate(this.parallel(), null, order);

        OrderBomMatcher.find({active: true}).exec(this.parallel());
      },
      function(err, order, orderBomMatchers)
      {
        if (err)
        {
          return done(err);
        }

        const orderBomMatcher = orderBomMatchers.find(orderBomMatcher => orderBomMatcher.matchOrder(order)) || null;

        orderBomMatcherCache.set(orderNo, orderBomMatcher);

        done(null, orderBomMatcher);
      }
    );
  }
};
