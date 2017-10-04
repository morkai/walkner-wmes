// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const step = require('h5.step');

module.exports = function editSettingsRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const PlanSettings = mongoose.model('PlanSettings');
  const PlanChange = mongoose.model('PlanChange');

  step(
    function()
    {
      PlanSettings.findById(req.params.id).exec(this.next());
    },
    function(err, planSettings)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!planSettings)
      {
        planSettings = new PlanSettings();
      }

      const planChange = new PlanChange(planSettings.applyChanges(
        req.body,
        userModule.createUserInfo(req.session.user, req)
      ));
      const anySettingsChanged = planChange.data.settings.length;

      if (planSettings.isNew || anySettingsChanged)
      {
        planSettings.save(this.parallel());
      }
      else
      {
        setImmediate(this.parallel(), null, planSettings);
      }

      if (anySettingsChanged)
      {
        planChange.save(this.parallel());
      }
      else
      {
        setImmediate(this.parallel(), null, planChange);
      }
    },
    function(err, planSettings, planChange)
    {
      if (err)
      {
        return next(err);
      }

      res.json(planSettings);

      const planChangeJson = planChange.toJSON();
      const changes = planChangeJson.data.settings;

      app.broker.publish('planning.settings.updated', {
        date: moment.utc(planChangeJson.plan).format('YYYY-MM-DD'),
        changes
      });

      if (changes.length)
      {
        app.broker.publish('planning.changes.created', planChangeJson);
      }
    }
  );
};
