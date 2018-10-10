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
      if (Array.isArray(logEntry.data.bom))
      {
        setImmediate(this.next(), null, null);
      }
      else
      {
        getComponentsToMatch(logEntry.data.orderNo, this.next());
      }
    },
    function(err, components)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (Array.isArray(components) && components.length === 0 && req.query.bomCheck !== '1')
      {
        components = null;
      }

      productionModule.checkSerialNumber(logEntry, components, this.next());
    },
    function(err, result)
    {
      if (err)
      {
        return next(err);
      }

      res.json(result);

      if (result.result !== 'SUCCESS')
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

  function getComponentsToMatch(orderNo, done)
  {
    if (productionModule.bomCache.has(orderNo))
    {
      return done(null, productionModule.bomCache.get(orderNo));
    }

    step(
      function()
      {
        const fields = {
          nc12: 1,
          mrp: 1,
          name: 1,
          description: 1,
          qty: 1,
          'bom.nc12': 1,
          'bom.qty': 1
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

        if (productionModule.bomCache.has('active'))
        {
          setImmediate(this.parallel(), null, productionModule.bomCache.get('active'));
        }
        else
        {
          OrderBomMatcher
            .find({active: true})
            .lean()
            .exec(this.parallel());
        }
      },
      function(err, order, orderBomMatchers)
      {
        if (err)
        {
          return done(err);
        }

        if (!productionModule.bomCache.has('active'))
        {
          productionModule.bomCache.set('active', orderBomMatchers);
        }

        const components = matchOrder(orderBomMatchers, order);

        productionModule.bomCache.set(orderNo, components);

        done(null, components);
      }
    );
  }

  function matchOrder(orderBomMatchers, order)
  {
    const result = [];
    const bom = new Map();

    order.bom.forEach(component => bom.set(component.nc12, component.qty));

    for (let i = 0; i < orderBomMatchers.length; ++i)
    {
      const obm = orderBomMatchers[i];

      if (obm.matchers.mrp.length && !obm.matchers.mrp.includes(order.mrp))
      {
        continue;
      }

      if (obm.matchers.nc12.length && !obm.matchers.nc12.includes(order.nc12))
      {
        continue;
      }

      if (obm.matchers.name.length && !obm.matchers.name.find(m => matchName(order, m)))
      {
        continue;
      }

      if (!obm.components.every(c => bom.has(c.nc12)))
      {
        continue;
      }

      obm.components.forEach(component =>
      {
        const componentQty = bom.get(component.nc12);
        let qtyPerProduct = componentQty / order.qty;

        if (component.single || qtyPerProduct.toString().includes('.'))
        {
          qtyPerProduct = 1;
        }

        for (let j = 0; j < qtyPerProduct; ++j)
        {
          result.push({
            nc12: component.nc12,
            description: qtyPerProduct === 1 ? component.description : `#${j + 1} ${component.description}`,
            unique: component.unique,
            pattern: component.pattern,
            nc12Index: component.nc12Index,
            snIndex: component.snIndex
          });
        }
      });

      break;
    }

    return result;
  }

  function matchName(order, nameMatcher)
  {
    try
    {
      const re = new RegExp(nameMatcher, 'i');

      return re.test(order.name) || re.test(order.description);
    }
    catch (x)
    {
      return false;
    }
  }
};
