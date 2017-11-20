// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function editPlanOrderRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Plan = mongoose.model('Plan');
  const PlanChange = mongoose.model('PlanChange');

  const planId = moment.utc(req.params.plan, 'YYYY-MM-DD').toDate();

  step(
    function()
    {
      const pipeline = [
        {$match: {_id: planId}},
        {$unwind: '$orders'},
        {$match: {'orders._id': req.params.order}},
        {$project: {
          _id: '$orders._id',
          quantityPlan: '$orders.quantityPlan',
          ignored: '$orders.ignored',
          urgent: '$orders.urgent'
        }}
      ];

      Plan.aggregate(pipeline, this.next());
    },
    function(err, results)
    {
      if (err)
      {
        return this.skip(err);
      }

      const planOrder = results[0];

      if (!planOrder)
      {
        return this.skip(app.createError('ORDER_NOT_FOUND', 404));
      }

      const newData = _.pick(req.body, ['quantityPlan', 'ignored', 'urgent']);
      const changedProps = Object.keys(newData);
      const oldData = _.pick(planOrder, changedProps);

      const changes = {};
      const update = {};

      changedProps.forEach(prop =>
      {
        const oldValue = oldData[prop];
        const newValue = newData[prop];

        if (newValue !== oldValue)
        {
          changes[prop] = [oldValue, newValue];
          update[`orders.$.${prop}`] = newValue;
        }
      });

      Plan.collection.update({_id: planId, 'orders._id': planOrder._id}, {$set: update}, this.parallel());

      const planChange = new PlanChange({
        plan: planId,
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
        date: planId
      });
    }
  );
};
