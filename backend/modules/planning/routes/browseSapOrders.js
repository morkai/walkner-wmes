// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function browseSapOrdersRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const Plan = mongoose.model('Plan');

  const mrp = _.isString(req.query.mrp) && /^[A-Za-z0-9]{1,10}$/.test(req.query.mrp) ? req.query.mrp : null;

  step(
    function()
    {
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

      const $match = {
        _id: {$in: plan.orders.map(o => o._id)}
      };

      if (mrp)
      {
        $match.mrp = mrp;
      }

      const $project = {
        quantityTodo: '$qty',
        quantityDone: {$ifNull: ['$qtyDone.total', 0]},
        statuses: 1,
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

      Order.aggregate([{$match}, {$project}], this.next());
    },
    function(err, sapOrders)
    {
      if (err)
      {
        return next(err);
      }

      sapOrders.forEach(order =>
      {
        order.delayReason = null;
        order.comment = '';
        order.comments = [];

        order.changes.forEach(change =>
        {
          if (change.comment)
          {
            order.comments.push({
              time: change.time,
              user: change.user,
              text: change.comment,
              delayReason: change.newValues.delayReason
            });
          }

          if ((!order.comment || !order.delayReason) && change.comment)
          {
            order.comment = change.comment;
          }

          if (!_.isUndefined(change.newValues.delayReason))
          {
            order.delayReason = change.newValues.delayReason;

            if (change.comment)
            {
              order.comment = change.comment;
            }
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
