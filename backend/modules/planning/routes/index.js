// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const readPlanRoute = require('./readPlan');
const browseSapOrdersRoute = require('./browseSapOrders');
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
  express.get('/planning/plans/:id', canView, readPlanRoute.bind(null, app, module));

  express.get('/planning/sapOrders/:id', canView, browseSapOrdersRoute.bind(null, app, module));

  express.get('/planning/settings', canView, express.crud.browseRoute.bind(null, app, PlanSettings));
  express.get('/planning/settings/:id', canView, express.crud.readRoute.bind(null, app, PlanSettings));
  express.put('/planning/settings/:id', canManage, editSettingsRoute.bind(null, app, module));

  express.get('/planning/changes', canView, express.crud.browseRoute.bind(null, app, PlanChange));
  express.get('/planning/changes/:id', canView, express.crud.readRoute.bind(null, app, PlanChange));

  function generatePlanRoute(req, res)
  {
    app.broker.publish('planning.generator.requested', {
      date: req.params.id
    });

    setTimeout(() => res.sendStatus(203), 333);
  }
};
