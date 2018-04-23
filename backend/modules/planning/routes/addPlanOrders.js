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
        .find({_id: {$in: req.body.orders}}, Plan.SAP_ORDER_FIELDS)
        .lean()
        .exec(this.parallel());

      Plan
        .findOne({_id: req.params.plan}, {_id: 1, 'orders._id': 1})
        .lean()
        .exec(this.parallel());

      PlanSettings
        .findById(req.params.plan)
        .lean()
        .exec(this.parallel());
    },
    function(err, sapOrders, plan, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!sapOrders.length)
      {
        return this.skip(app.createError('ORDER_NOT_FOUND', 404));
      }

      if (!settings)
      {
        return this.skip(app.createError('PLAN_NOT_FOUND', 404));
      }

      const planOrders = new Set();

      plan.orders.forEach(planOrder => planOrders.add(planOrder._id));

      const addedOrders = [];

      sapOrders.forEach(sapOrder =>
      {
        if (planOrders.has(sapOrder._id))
        {
          return;
        }

        const mrpSettings = settings.mrps.find(mrpSettings => mrpSettings._id === sapOrder.mrp);
        const hardComponents = new Set(mrpSettings ? mrpSettings.hardComponents : []);
        const newPlanOrder = Plan.createPlanOrder('added', sapOrder, hardComponents);

        newPlanOrder.urgent = !!req.body.urgent;

        addedOrders.push(newPlanOrder);
      });

      if (addedOrders.length === 0)
      {
        return this.skip(app.createError('ALREADY_EXISTS', 400));
      }

      const planChange = new PlanChange({
        plan: settings._id,
        date: new Date(),
        user: userModule.createUserInfo(req.session.user, req),
        data: {addedOrders}
      });

      planChange.save(this.parallel());

      Plan.collection.update(
        {_id: planChange.plan},
        {$push: {orders: {$each: addedOrders}}},
        this.parallel()
      );
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
