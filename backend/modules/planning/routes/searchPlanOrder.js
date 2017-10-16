// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function searchPlanOrderRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const Plan = mongoose.model('Plan');

  step(
    function()
    {
      Order
        .findById(req.params.order, Plan.SAP_ORDER_FIELDS)
        .lean()
        .exec(this.parallel());

      Plan
        .find({'orders._id': req.params.order}, {_id: 1})
        .lean()
        .exec(this.parallel());
    },
    function(err, sapOrder, plans)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!sapOrder)
      {
        return next(app.createError('ORDER_NOT_FOUND', 404));
      }

      res.json({
        plans: plans.map(plan => plan._id),
        order: Plan.createPlanOrder(sapOrder, null)
      });
    }
  );
};
