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
  const XiconfHidLamp = mongoose.model('XiconfHidLamp');
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
    if (productionModule.bomMatcherCache.has(orderNo))
    {
      return done(null, productionModule.bomMatcherCache.get(orderNo));
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
          bom: 1
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

        if (productionModule.bomMatcherCache.has('active'))
        {
          setImmediate(this.parallel(), null, productionModule.bomMatcherCache.get('active'));
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
          return this.skip(err);
        }

        if (!productionModule.bomMatcherCache.has('active'))
        {
          productionModule.bomMatcherCache.set('active', orderBomMatchers);
        }

        const components = matchOrder(orderBomMatchers, order);

        productionModule.bomMatcherCache.set(orderNo, components);

        setImmediate(this.group(), null, components);

        const extras = {
          HID: []
        };

        components.forEach(component =>
        {
          if (component.labelPattern.includes('@HID.ID@'))
          {
            extras.HID.push(component);
          }
        });

        if (extras.HID.length)
        {
          replaceHidExtras(order, extras.HID, this.group());
        }
      },
      function(err, results)
      {
        if (err)
        {
          return done(err);
        }

        done(null, results[0]);
      }
    );
  }

  function matchOrder(orderBomMatchers, order)
  {
    const result = [];
    const bom = new Map();
    const used = new Set();

    order.bom.forEach(component => bom.set(component.nc12, component.qty));

    orderBomMatchers.forEach(obm =>
    {
      if (obm.matchers.mrp.length && !obm.matchers.mrp.includes(order.mrp))
      {
        return;
      }

      if (obm.matchers.nc12.length && !obm.matchers.nc12.includes(order.nc12))
      {
        return;
      }

      if (obm.matchers.name.length && !obm.matchers.name.find(m => matchName(order, m)))
      {
        return;
      }

      const obmComponents = obm.components.filter(obmComponent =>
      {
        if (obmComponent.pattern === '' || obmComponent.pattern instanceof RegExp)
        {
          return true;
        }

        try
        {
          obmComponent.pattern = new RegExp(
            /^[0-9]{12}$/.test(obmComponent.pattern) ? `^${obmComponent.pattern}$` : obmComponent.pattern
          );
        }
        catch (err)
        {
          return false;
        }

        return true;
      });

      obmComponents.forEach(obmComponent =>
      {
        if (obmComponent.pattern !== '')
        {
          return;
        }

        result.push({
          nc12: '000000000000',
          description: obmComponent.description
            .replace(/@ORDER\.NO@/g, order._id)
            .replace(/@ORDER\.12NC@/g, order.nc12),
          unique: obmComponent.unique,
          labelPattern: obmComponent.labelPattern
            .replace(/@ORDER\.NO@/g, order._id)
            .replace(/@ORDER\.12NC@/g, order.nc12),
          nc12Index: obmComponent.nc12Index,
          snIndex: obmComponent.snIndex
        });
      });

      order.bom.forEach(orderComponent =>
      {
        if (used.has(orderComponent.nc12))
        {
          return;
        }

        const obmComponent = matchComponent(orderComponent, obmComponents);

        if (!obmComponent)
        {
          return;
        }

        used.add(orderComponent.nc12);

        let qtyPerProduct = orderComponent.qty / order.qty;

        if (obmComponent.single || qtyPerProduct.toString().includes('.'))
        {
          qtyPerProduct = 1;
        }

        const description = obmComponent.description
          .replace(/@COMPONENT\.ITEM@/g, orderComponent.item)
          .replace(/@COMPONENT\.12NC@/g, orderComponent.nc12)
          .replace(/@COMPONENT\.NAME@/g, orderComponent.name)
          .replace(/@ORDER\.NO@/g, order._id)
          .replace(/@ORDER\.12NC@/g, order.nc12);

        const labelPattern = obmComponent.labelPattern
          .replace(/@COMPONENT\.ITEM@/g, orderComponent.item)
          .replace(/@COMPONENT\.12NC@/g, orderComponent.nc12)
          .replace(/@COMPONENT\.NAME@/g, _.escapeRegExp(orderComponent.name))
          .replace(/@ORDER\.NO@/g, order._id)
          .replace(/@ORDER\.12NC@/g, order.nc12);

        for (let j = 0; j < qtyPerProduct; ++j)
        {
          result.push({
            nc12: orderComponent.nc12,
            description: qtyPerProduct === 1 ? description : `#${j + 1} ${description}`,
            unique: obmComponent.unique,
            single: obmComponent.single,
            labelPattern,
            nc12Index: obmComponent.nc12Index,
            snIndex: obmComponent.snIndex
          });
        }
      });
    });

    return result;
  }

  function matchComponent(orderComponent, obmComponents)
  {
    return obmComponents.find(obmComponent =>
    {
      return obmComponent.pattern !== ''
        && (obmComponent.pattern.test(orderComponent.nc12) || obmComponent.pattern.test(orderComponent.name));
    });
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

  function replaceHidExtras(order, obmComponents, done)
  {
    XiconfHidLamp.find({nc12: {$in: obmComponents.map(c => c.nc12)}}).lean().exec((err, hidLamps) =>
    {
      if (err)
      {
        return done(err);
      }

      const nc12ToHid = new Map();

      hidLamps.forEach(hidLamp => nc12ToHid.set(hidLamp.nc12, hidLamp._id));

      obmComponents.forEach(obmComponent =>
      {
        if (!nc12ToHid.has(obmComponent.nc12))
        {
          return module.warn(`Missing HID for 12NC: ${obmComponent.nc12}`);
        }

        obmComponent.labelPattern = obmComponent.labelPattern.replace(/@HID\.ID@/g, nc12ToHid.get(obmComponent.nc12));
      });

      done();
    });
  }
};
