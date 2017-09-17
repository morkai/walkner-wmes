// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function setUpPlanningRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');
  const PlanChange = mongoose.model('PlanChange');

  const canView = userModule.auth('USER');
  const canManage = userModule.auth('PLANNING:MANAGE');

  express.get('/planning/plans', canView, express.crud.browseRoute.bind(null, app, Plan));
  express.post('/planning/plans/:id;generate', canManage, generatePlanRoute);
  express.get('/planning/plans/:id', canView, express.crud.readRoute.bind(null, app, Plan));

  express.get('/planning/settings/:id', canView, express.crud.readRoute.bind(null, app, PlanSettings));
  express.put('/planning/settings/:id', canView, saveSettingsRoute);

  express.get('/planning/changes', canView, express.crud.browseRoute.bind(null, app, PlanChange));
  express.get('/planning/changes/:id', canView, express.crud.readRoute.bind(null, app, PlanChange));

  function generatePlanRoute(req, res)
  {
    app.broker.publish('planning.generator.requested', {
      date: req.params.id,
      reload: true
    });

    setTimeout(() => res.sendStatus(203), 333);
  }

  function saveSettingsRoute(req, res, next)
  {
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

        planSettings.set(req.body).save(this.next());
      },
      function(err, planSettings)
      {
        if (err)
        {
          return next(err);
        }

        const json = planSettings.toJSON();

        res.json(json);

        app.broker.publish('planning.settings.updated', json);
      }
    );
  }
};
