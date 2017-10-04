// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const step = require('h5.step');
const editSettingsRoute = require('./editSettings');

module.exports = function setUpPlanningRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');
  const PlanChange = mongoose.model('PlanChange');

  const canView = userModule.auth('PLANNING:VIEW');
  const canManage = userModule.auth('PLANNING:MANAGE', 'PLANNING:PLANNER');

  express.get('/planning/plans', canView, express.crud.browseRoute.bind(null, app, Plan));
  express.post('/planning/plans/:id;generate', canManage, generatePlanRoute);
  express.get('/planning/plans/:id', canView, readPlanRoute);

  express.get('/planning/settings', canView, express.crud.browseRoute.bind(null, app, PlanSettings));
  express.get('/planning/settings/:id', canView, express.crud.readRoute.bind(null, app, PlanSettings));
  express.put('/planning/settings/:id', canManage, editSettingsRoute.bind(null, app, module));

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

  function readPlanRoute(req, res, next)
  {
    step(
      function()
      {
        const fields = {};

        if (req.query.pceTimes === '0')
        {
          fields['lines.pceTimes'] = 0;
        }

        Plan.findById(req.params.id, fields).lean().exec(this.parallel());

        if (req.query.minMaxDates === '1')
        {
          Plan.findOne({}, {_id: 1}).sort({_id: 1}).lean().exec(this.parallel());
          Plan.findOne({}, {_id: 1}).sort({_id: -1}).lean().exec(this.parallel());
        }
      },
      function(err, plan, minDate, maxDate)
      {
        if (err)
        {
          return next(err);
        }

        if (!plan)
        {
          return next(app.createError('NOT_FOUND', 404));
        }

        if (minDate)
        {
          plan.minDate = moment.utc(minDate._id).format('YYYY-MM-DD');
        }

        if (maxDate)
        {
          plan.maxDate = moment.utc(maxDate._id).format('YYYY-MM-DD');
        }

        res.json(plan);
      }
    );
  }
};
