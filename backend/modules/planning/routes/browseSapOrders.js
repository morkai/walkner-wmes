// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const step = require('h5.step');

module.exports = function browseSapOrdersRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const Plan = mongoose.model('Plan');

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

      const pipeline = [
        {$match: {
          _id: {$in: plan.orders.map(o => o._id)}
        }},
        {$project: {
          quantityTodo: '$qty',
          quantityDone: {$ifNull: ['$qtyDone.total', 0]},
          statuses: 1
        }}
      ];

      Order.aggregate(pipeline, this.next());
    },
    function(err, sapOrders)
    {
      if (err)
      {
        return next(err);
      }

      res.json({
        totalCount: sapOrders.length,
        collection: sapOrders
      });
    }
  );
};
