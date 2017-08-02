// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const execFile = require('child_process').execFile;
const _ = require('lodash');
const step = require('h5.step');
const resolveProductName = require('../util/resolveProductName');

module.exports = function importQueueFile(app, module, filePath, date, user, done)
{
  if (module.importing)
  {
    return done(app.createError('IN_PROGRESS', 400));
  }

  if (!filePath)
  {
    return done(app.createError('INVALID_FILE', 400));
  }

  module.importing = true;

  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const PaintShopOrder = mongoose.model('PaintShopOrder');

  step(
    function()
    {
      const args = [
        __dirname + '/parseOrderQueue.js',
        filePath,
        date || '0000-00-00'
      ];
      const opts = {
        timeout: 10000,
        maxBuffer: 2 * 1024 * 1024
      };

      execFile(process.execPath, args, opts, this.next());
    },
    function(err, json)
    {
      if (err)
      {
        return this.skip(err);
      }

      this.psOrders = {};
      this.orderToPsOrders = {};
      this.orderToChildPsOrders = {};

      try
      {
        JSON.parse(json || []).forEach(psOrder =>
        {
          psOrder.date = new Date(psOrder.date);

          this.psOrders[psOrder._id] = psOrder;

          if (!this.orderToPsOrders[psOrder.order])
          {
            this.orderToPsOrders[psOrder.order] = [];
          }

          this.orderToPsOrders[psOrder.order].push(psOrder);

          psOrder.orders.forEach(childPsOrder =>
          {
            if (!this.orderToChildPsOrders[childPsOrder.order])
            {
              this.orderToChildPsOrders[childPsOrder.order] = [];
            }

            this.orderToChildPsOrders[childPsOrder.order].push(childPsOrder);
          });
        });
      }
      catch (err)
      {
        return this.skip(err);
      }

      const paintShopOrderIds = Object.keys(this.psOrders);

      if (!paintShopOrderIds.length)
      {
        return this.skip(app.createError('EMPTY_FILE', 400));
      }

      PaintShopOrder
        .find({_id: {$in: paintShopOrderIds}})
        .lean()
        .exec(this.parallel());

      Order
        .find(
          {_id: {$in: Object.keys(this.orderToPsOrders)}},
          {nc12: 1, name: 1, description: 1}
        )
        .lean()
        .exec(this.parallel());

      Order
        .find(
          {_id: {$in: Object.keys(this.orderToChildPsOrders)}},
          {name: 1, description: 1, qty: 1, 'bom.nc12': 1, 'bom.unit': 1}
        )
        .lean()
        .exec(this.parallel());
    },
    function(err, existingPsOrders, orders, childOrders)
    {
      if (err)
      {
        return this.skip(err);
      }

      this.existingPsOrders = existingPsOrders;
      this.orders = orders;
      this.childOrders = childOrders;

      setImmediate(this.next());
    },
    function()
    {
      this.orders.forEach(order =>
      {
        const psOrders = this.orderToPsOrders[order._id];

        if (!psOrders)
        {
          return;
        }

        psOrders.forEach(psOrder =>
        {
          psOrder.nc12 = order.nc12;
          psOrder.name = resolveProductName(order);
        });
      });

      setImmediate(this.next());
    },
    function()
    {
      this.childOrders.forEach(childOrder =>
      {
        const childPsOrders = this.orderToChildPsOrders[childOrder._id];

        if (!childPsOrders)
        {
          return;
        }

        childPsOrders.forEach(childPsOrder =>
        {
          childPsOrder.name = resolveProductName(childOrder);
          childPsOrder.qty = childOrder.qty;

          childPsOrder.components.forEach(psComponent =>
          {
            const orderComponent = _.find(childOrder.bom, c => c.nc12 === psComponent.nc12);

            if (orderComponent)
            {
              psComponent.unit = orderComponent.unit;
            }
          });
        });
      });

      setImmediate(this.next());
    },
    function()
    {
      const updates = [];

      _.forEach(this.existingPsOrders, existingPsOrder =>
      {
        const newPsOrder = this.psOrders[existingPsOrder._id];

        this.date = newPsOrder.date;

        delete this.psOrders[existingPsOrder._id];

        if (newPsOrder && existingPsOrder.status === 'new')
        {
          updates.push(newPsOrder);
        }
      });

      const inserts = _.values(this.psOrders);

      this.updateCount = updates.length;
      this.insertCount = inserts.length;

      updates.forEach(o => PaintShopOrder.collection.update({_id: o._id}, o, this.group()));

      if (this.insertCount)
      {
        this.date = inserts[0].date;

        PaintShopOrder.collection.insert(inserts, this.group());
      }
    },
    function(err)
    {
      module.importing = false;

      const result = {
        user: user,
        date: this.date,
        updateCount: this.updateCount,
        insertCount: this.insertCount
      };

      if (!err)
      {
        app.broker.publish('paintShop.orders.imported', result);
      }

      done(err, result);
    }
  );
};
