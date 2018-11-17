// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function browseSapOrdersRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const OrderEto = mongoose.model('OrderEto');
  const Plan = mongoose.model('Plan');

  const mrp = _.isString(req.query.mrp) && /^[A-Za-z0-9]{1,10}$/.test(req.query.mrp) ? req.query.mrp : null;

  step(
    function()
    {
      if (module.eto)
      {
        return;
      }

      OrderEto.aggregate([{$group: {_id: null, nc12: {$addToSet: '$_id'}}}], this.next());
    },
    function(err, orderEtos)
    {
      if (err)
      {
        module.error(`Failed to read ETO files: ${err.message}`);
      }

      if (orderEtos && orderEtos.length === 1)
      {
        module.eto = new Set();

        orderEtos[0].nc12.forEach(nc12 =>
        {
          module.eto.add(nc12);
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
        psStatus: 1,
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
    },
    function(err, sapOrders)
    {
      if (err)
      {
        return next(err);
      }

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
