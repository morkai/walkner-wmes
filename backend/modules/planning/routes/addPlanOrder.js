// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function addPlanOrderRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');
  const PlanChange = mongoose.model('PlanChange');

  step(
    function()
    {
      Order
        .findById(req.params.order, Plan.SAP_ORDER_FIELDS)
        .lean()
        .exec(this.parallel());

      Plan
        .findOne({_id: req.params.plan, 'orders._id': req.params.order}, {_id: 1})
        .lean()
        .exec(this.parallel());

      PlanSettings
        .findById(req.params.plan)
        .exec(this.parallel());
    },
    function(err, sapOrder, plan, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!sapOrder)
      {
        return this.skip(app.createError('ORDER_NOT_FOUND', 404));
      }

      if (!settings)
      {
        return this.skip(app.createError('PLAN_NOT_FOUND', 404));
      }

      if (plan)
      {
        return this.skip(app.createError('ALREADY_EXISTS', 400));
      }

      const mrpSettings = settings.mrps.find(mrpSettings => mrpSettings._id === sapOrder.mrp);
      const newPlanOrder = Plan.createPlanOrder(sapOrder, new Set(mrpSettings ? mrpSettings.hardComponents : []));

      newPlanOrder.added = true;

      const planChange = new PlanChange({
        plan: settings._id,
        date: new Date(),
        user: userModule.createUserInfo(req.session.user, req),
        data: {
          addedOrders: [newPlanOrder]
        }
      });

      planChange.save(this.parallel());

      Plan.update({_id: planChange.plan}, {$push: {orders: newPlanOrder}}, this.parallel());
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
