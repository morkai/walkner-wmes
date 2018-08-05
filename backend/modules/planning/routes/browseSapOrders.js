// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');

module.exports = function browseSapOrdersRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const PaintShopOrder = mongoose.model('PaintShopOrder');
  const Plan = mongoose.model('Plan');

  const mrp = _.isString(req.query.mrp) && /^[A-Za-z0-9]{1,10}$/.test(req.query.mrp) ? req.query.mrp : null;

  step(
    function()
    {
      if (!module.eto && module.config.etoPath)
      {
        fs.readdir(module.config.etoPath, this.next());
      }
    },
    function(err, files)
    {
      if (err)
      {
        module.error(`Failed to read ETO files: ${err.message}`);
      }

      if (files)
      {
        module.eto = new Set();

        files.forEach(file =>
        {
          module.eto.add(file.replace('.html', ''));
        });
      }

      Plan.findById(req.params.id, {'orders._id': 1}).lean().exec(this.next());
    },
    function(err, plan)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!plan)
      {
        return this.skip(app.createError('NOT_FOUND', 404));
      }

      const orders = plan.orders.map(o => o._id);
      const $match = {
        _id: {$in: orders}
      };

      if (mrp)
      {
        $match.mrp = mrp;
      }

      const $project = {
        nc12: 1,
        quantityTodo: '$qty',
        quantityDone: '$qtyDone',
        statuses: 1,
        whStatus: 1,
        whTime: 1,
        whDropZone: 1,
        changes: {
          $filter: {
            input: '$changes',
            cond: {
              $or: [
                {$ne: ['$$this.comment', '']},
                {$eq: ['$$this.oldValues.delayReason', null]},
                {$eq: ['$$this.newValues.delayReason', null]}
              ]
            }
          }
        }
      };

      Order.aggregate([{$match}, {$project}], this.parallel());

      const conditions = {
        order: {$in: orders}
      };

      if (mrp)
      {
        conditions.mrp = mrp;
      }

      PaintShopOrder
        .find(conditions, {_id: 0, order: 1, status: 1})
        .lean()
        .exec(this.parallel());
    },
    function(err, sapOrders, psOrders)
    {
      if (err)
      {
        return next(err);
      }

      const psStatuses = new Map();

      psOrders.forEach(order =>
      {
        const lastStatus = psStatuses.get(order.order);

        if (!lastStatus)
        {
          psStatuses.set(order.order, order.status);

          return;
        }

        if (lastStatus !== 'finished' && order.status === 'finished')
        {
          return;
        }

        psStatuses.set(order.order, order.status);
      });

      const eto = module.eto || new Set();

      sapOrders.forEach(order =>
      {
        if (_.isEmpty(order.quantityDone))
        {
          order.quantityDone = {
            total: 0,
            byOperation: {}
          };
        }

        order.eto = eto.has(order.nc12);
        order.nc12 = undefined;
        order.psStatus = psStatuses.get(order._id);
        order.delayReason = null;
        order.comments = [];

        order.changes.forEach(change =>
        {
          if (change.comment)
          {
            order.comments.push({
              source: change.source,
              time: change.time,
              user: change.user,
              text: change.comment,
              delayReason: change.newValues.delayReason
            });
          }

          if (!_.isUndefined(change.newValues.delayReason))
          {
            order.delayReason = change.newValues.delayReason;
          }
        });

        order.changes = undefined;
      });

      res.json({
        totalCount: sapOrders.length,
        collection: sapOrders
      });
    }
  );
};
