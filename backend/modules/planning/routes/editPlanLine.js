// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const deepEqual = require('deep-equal');

module.exports = function editPlanLineRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Plan = mongoose.model('Plan');
  const PlanChange = mongoose.model('PlanChange');

  const planId = moment.utc(req.params.plan, 'YYYY-MM-DD').toDate();

  step(
    function()
    {
      const fields = {
        'lines._id': 1,
        'lines.frozenOrders': 1
      };

      Plan.findById(planId, fields).lean().exec(this.next());
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

      const planLine = plan.lines.find(planLine => planLine._id === req.params.line);

      if (!planLine)
      {
        return this.skip(app.createError('LINE_NOT_FOUND', 404));
      }

      const newData = _.pick(req.body, ['frozenOrders']);
      const changedProps = Object.keys(newData);
      const oldData = _.pick(planLine, changedProps);

      const changes = {};
      const update = {};

      changedProps.forEach(prop =>
      {
        const oldValue = oldData[prop];
        const newValue = newData[prop];

        if (!deepEqual(newValue, oldValue))
        {
          changes[prop] = [oldValue, newValue];
          update[`lines.$.${prop}`] = newValue;
        }
      });

      if (_.isEmpty(changes))
      {
        return this.skip();
      }

      Plan.collection.update({_id: planId, 'lines._id': planLine._id}, {$set: update}, this.parallel());

      const planChange = new PlanChange({
        plan: planId,
        date: new Date(),
        user: userModule.createUserInfo(req.session.user, req),
        data: {
          changedLines: [
            {
              _id: planLine._id,
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
