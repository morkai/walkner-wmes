// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function editPlanOrderRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Plan = mongoose.model('Plan');
  const PlanChange = mongoose.model('PlanChange');

  step(
    function()
    {
      Plan.findById(req.params.plan).exec(this.next());
    },
    function(err, plan)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!plan)
      {
        return this.skip(app.createError('PLAN_NOT_FOUND', 404));
      }

      const planOrder = plan.orders.find(o => o._id === req.params.order);

      if (!planOrder)
      {
        return this.skip(app.createError('ORDER_NOT_FOUND', 404));
      }

      const newData = _.pick(req.body, ['quantityPlan', 'ignored', 'urgent']);
      const oldData = _.pick(planOrder, Object.keys(newData));

      planOrder.set(newData);

      if (!planOrder.isModified())
      {
        return this.skip();
      }

      const changes = {};

      planOrder.modifiedPaths().forEach(property =>
      {
        changes[property] = [oldData[property], newData[property]];
      });

      const planChange = new PlanChange({
        plan: plan._id,
        date: new Date(),
        user: userModule.createUserInfo(req.session.user, req),
        data: {
          changedOrders: [
            {
              _id: planOrder._id,
              changes: changes
            }
          ]
        }
      });

      plan.save(this.parallel());
      planChange.save(this.parallel());
    },
    function(err, plan, planChange)
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);

      if (!planChange)
      {
        return;
      }

      app.broker.publish('planning.changes.created', planChange.toJSON());

      app.broker.publish('planning.generator.requested', {
        date: plan._id
      });
    }
  );
};
