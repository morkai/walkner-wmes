// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function removePlanOrderRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Plan = mongoose.model('Plan');
  const PlanChange = mongoose.model('PlanChange');

  step(
    function()
    {
      Plan
        .findOne({_id: req.params.plan, 'orders._id': req.params.order}, {'orders._id': 1, 'orders.source': 1})
        .lean()
        .exec(this.parallel());
    },
    function(err, plan)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!plan)
      {
        return this.skip(app.createError('ORDER_NOT_FOUND', 404));
      }

      const planOrder = plan.orders.find(o => o._id === req.params.order);

      if (planOrder.source !== 'added')
      {
        return this.skip(app.createError('ORDER_NOT_ADDED', 400));
      }

      const planChange = new PlanChange({
        plan: plan._id,
        date: new Date(),
        user: userModule.createUserInfo(req.session.user, req),
        data: {
          removedOrders: [{
            _id: planOrder._id,
            reason: 'REMOVED'
          }]
        }
      });

      planChange.save(this.parallel());

      Plan.collection.update({_id: planChange.plan}, {$pull: {orders: {_id: planOrder._id}}}, this.parallel());
    },
    function(err, planChange)
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);

      app.broker.publish('planning.changes.created', planChange.toJSON());

      app.broker.publish('planning.generator.requested', {
        date: planChange.plan
      });
    }
  );
};
