// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const readPlanRoute = require('./readPlan');
const searchPlanOrderRoute = require('./searchPlanOrder');
const addPlanOrdersRoute = require('./addPlanOrders');
const addPlanOrderRoute = require('./addPlanOrder');
const editPlanOrderRoute = require('./editPlanOrder');
const removePlanOrderRoute = require('./removePlanOrder');
const editPlanLineRoute = require('./editPlanLine');
const browseSapOrdersRoute = require('./browseSapOrders');
const browseLateOrdersRoute = require('./browseLateOrders');
const editSettingsRoute = require('./editSettings');
const editWhOrderStatusRoute = require('./editWhOrderStatus');

module.exports = function setUpPlanningRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const settingsModule = app[module.config.settingsId];
  const mongoose = app[module.config.mongooseId];
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');
  const PlanChange = mongoose.model('PlanChange');
  const WhOrderStatus = mongoose.model('WhOrderStatus');

  const canView = userModule.auth('LOCAL', 'PLANNING:VIEW');
  const canManage = userModule.auth('PLANNING:MANAGE', 'PLANNING:PLANNER');

  express.get('/planning/plans', canView, express.crud.browseRoute.bind(null, app, Plan));
  express.post('/planning/plans/:id;generate', canManage, generatePlanRoute);
  express.get('/planning/plans/:id', canView, readPlanRoute.bind(null, app, module));

  express.post('/planning/plans/:plan/orders', canManage, addPlanOrdersRoute.bind(null, app, module));
  express.get('/planning/plans/:plan/orders/:order', canManage, searchPlanOrderRoute.bind(null, app, module));
  express.post('/planning/plans/:plan/orders/:order', canManage, addPlanOrderRoute.bind(null, app, module));
  express.patch('/planning/plans/:plan/orders/:order', canManage, editPlanOrderRoute.bind(null, app, module));
  express.delete('/planning/plans/:plan/orders/:order', canManage, removePlanOrderRoute.bind(null, app, module));

  express.patch('/planning/plans/:plan/lines/:line', canManage, editPlanLineRoute.bind(null, app, module));

  express.get('/planning/sapOrders/:id', canView, browseSapOrdersRoute.bind(null, app, module));

  express.get('/planning/lateOrders/:id', canView, browseLateOrdersRoute.bind(null, app, module));

  express.get('/planning/settings', canView, browseSettingsRoute);
  express.get('/planning/settings/:id', canView, beforeSettingsRead, express.crud.readRoute.bind(null, app, {
    model: PlanSettings,
    prepareResult: getGlobalSettings
  }));
  express.put('/planning/settings/:id', canManage, editSettingsRoute.bind(null, app, module));

  express.get('/planning/changes', canView, express.crud.browseRoute.bind(null, app, PlanChange));
  express.get('/planning/changes/:id', canView, express.crud.readRoute.bind(null, app, PlanChange));

  express.get(
    '/planning/whOrderStatuses',
    canView,
    express.crud.browseRoute.bind(null, app, WhOrderStatus)
  );
  express.post(
    '/planning/whOrderStatuses',
    userModule.auth('PLANNING:WHMAN'),
    editWhOrderStatusRoute.bind(null, app, module)
  );

  function generatePlanRoute(req, res)
  {
    app.broker.publish('planning.generator.requested', {
      date: req.params.id
    });

    res.sendStatus(204);
  }

  function browseSettingsRoute(req, res, next)
  {
    if (req.headers['x-global'] === '1')
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^planning\\.']
      };

      express.crud.browseRoute(app, settingsModule.Setting, req, res, next);
    }
    else
    {
      express.crud.browseRoute(app, PlanSettings, req, res, next);
    }
  }

  function beforeSettingsRead(req, res, next)
  {
    if (req.params.id === '0000-00-00')
    {
      req.model = {
        _id: '0000-00-00'
      };
    }

    return next();
  }

  function getGlobalSettings(planSettings, done)
  {
    settingsModule.findValues('planning.', (err, globalSettings) =>
    {
      if (err)
      {
        return done(err);
      }

      planSettings.global = globalSettings;

      done(null, planSettings);
    });
  }
};
