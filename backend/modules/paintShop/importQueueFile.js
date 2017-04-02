// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const execFile = require('child_process').execFile;
const _ = require('lodash');
const step = require('h5.step');

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

  const PaintShopOrder = app[module.config.mongooseId].model('PaintShopOrder');

  step(
    function()
    {
      const args = [
        __dirname + '/parseOrderQueue.js',
        filePath,
        date || '0000-00-00'
      ];
      const opts = {
        timeout: 10000
      };

      execFile(process.execPath, args, opts, this.next());
    },
    function(err, json)
    {
      if (err)
      {
        return this.skip(err);
      }

      this.orders = {};

      try
      {
        JSON.parse(json || []).forEach(o =>
        {
          o.date = new Date(o.date);

          this.orders[o._id] = o;

          return o;
        });
      }
      catch (err)
      {
        return this.skip(err);
      }

      const orderIds = Object.keys(this.orders);

      if (!orderIds.length)
      {
        return this.skip(app.createError('EMPTY_FILE', 400));
      }

      PaintShopOrder
        .find({_id: {$in: orderIds}})
        .lean()
        .exec(this.next());
    },
    function(err, existingOrders)
    {
      if (err)
      {
        return this.skip(err);
      }

      const updates = [];

      _.forEach(existingOrders, existingOrder =>
      {
        const newOrder = this.orders[existingOrder._id];

        this.date = newOrder.date;

        delete this.orders[existingOrder._id];

        if (newOrder && existingOrder.status === 'waiting')
        {
          updates.push(newOrder);
        }
      });

      const inserts = _.values(this.orders);

      this.updateCount = updates.length;
      this.insertCount = inserts.length;

      _.forEach(updates, o => PaintShopOrder.collection.update({_id: o._id}, o, this.group()));

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
