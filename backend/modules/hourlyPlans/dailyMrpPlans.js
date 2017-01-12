// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const execFile = require('child_process').execFile;
const _ = require('lodash');
const step = require('h5.step');

module.exports = function setUpDailyMrpPlans(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const DailyMrpPlan = mongoose.model('DailyMrpPlan');

  const locks = {};

  module.dailyMrpPlans = {

    parse: function(file, done)
    {
      const args = [
        __dirname + '/parseDailyMrpPlan.js',
        file
      ];
      const opts = {
        timeout: 10000
      };

      execFile(process.execPath, args, opts, function(err, stdout)
      {
        done(err, stdout || '{}');

        fs.unlink(file, () => {});
      });
    },

    import: function(dailyMrpPlans, instanceId, done)
    {
      if (!_.isArray(dailyMrpPlans) || _.isEmpty(dailyMrpPlans))
      {
        return done(app.createError('INVALID_INPUT', 400));
      }

      step(
        function()
        {
          const now = Date.now();

          this.dailyMrpPlans = dailyMrpPlans.map(data => new DailyMrpPlan(Object.assign(data, {updatedAt: now})));

          this.dailyMrpPlans.forEach(plan => plan.validate(this.group()));
        },
        function(err)
        {
          if (err)
          {
            return done(err);
          }

          const options = {
            new: true,
            upsert: true,
            runValidators: false
          };

          this.dailyMrpPlans.forEach(
            plan => DailyMrpPlan.update({_id: plan._id}, plan, options, this.group())
          );
        },
        function(err)
        {
          if (err)
          {
            return done(err);
          }

          const importedPlans = {};

          this.dailyMrpPlans.forEach(plan => importedPlans[plan._id] = plan.updatedAt);
          this.dailyMrpPlans = null;

          done(null, importedPlans);

          app.broker.publish('dailyMrpPlans.imported', {
            instanceId: instanceId,
            plans: dailyMrpPlans.map(plan => plan._id)
          });
        }
      );
    },

    update: function(action, planId, data, instanceId, done)
    {
      if (!_.isPlainObject(data) || _.isEmpty(data))
      {
        return done(app.createError('INVALID_DATA'));
      }

      const execute = this.actions[action];

      if (!execute)
      {
        return done(app.createError('UNKNOWN_ACTION'));
      }

      DailyMrpPlan.findById(planId, function(err, plan)
      {
        if (err)
        {
          return done(err);
        }

        if (!plan)
        {
          return done(app.createError('PLAN_NOT_FOUND', 400));
        }

        execute(plan, data, instanceId, done);
      });
    },

    actions: {

      resetLines: function(plan, data, instanceId, done)
      {
        step(
          function()
          {
            plan.updatedAt = Date.now();
            plan.lines = data.lines;

            plan.save(this.next());
          },
          function(err, plan)
          {
            if (err)
            {
              return done(err);
            }

            done(null, plan.updatedAt);

            app.broker.publish('dailyMrpPlans.updated', {
              instanceId: instanceId,
              updatedAt: plan.updatedAt,
              action: 'resetLines',
              planId: plan._id,
              data: {
                lines: plan.lines
              }
            });
          }
        );
      },

      updateLine: function(plan, data, instanceId, done)
      {
        step(
          function()
          {
            plan.updatedAt = Date.now();

            plan.lines.forEach(function(line)
            {
              if (line._id === data._id)
              {
                line.set(data);
              }
            });

            plan.save(this.next());
          },
          function(err, plan)
          {
            if (err)
            {
              return done(err);
            }

            done(null, plan.updatedAt);

            app.broker.publish('dailyMrpPlans.updated', {
              instanceId: instanceId,
              updatedAt: plan.updatedAt,
              action: 'updateLine',
              planId: plan._id,
              data: data
            });
          }
        );
      },

      resetOrders: function(plan, data, instanceId, done)
      {
        step(
          function()
          {
            plan.updatedAt = Date.now();
            plan.orders = data.orders;

            plan.save(this.next());
          },
          function(err, plan)
          {
            if (err)
            {
              return done(err);
            }

            done(null, plan.updatedAt);

            app.broker.publish('dailyMrpPlans.updated', {
              instanceId: instanceId,
              updatedAt: plan.updatedAt,
              action: 'resetOrders',
              planId: plan._id,
              data: {
                orders: plan.orders
              }
            });
          }
        );
      },

      updateOrder: function(plan, data, instanceId, done)
      {
        step(
          function()
          {
            plan.updatedAt = Date.now();

            plan.orders.forEach(function(order)
            {
              if (order._id === data._id)
              {
                order.set(data);
              }
            });

            plan.save(this.next());
          },
          function(err, plan)
          {
            if (err)
            {
              return done(err);
            }

            done(null, plan.updatedAt);

            app.broker.publish('dailyMrpPlans.updated', {
              instanceId: instanceId,
              updatedAt: plan.updatedAt,
              action: 'updateOrder',
              planId: plan._id,
              data: data
            });
          }
        );
      }

    }

  };
};
