// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './HourlyPlan',
  './pages/HourlyPlanListPage',
  './pages/HourlyPlanAddFormPage',
  './pages/HourlyPlanEditFormPage',
  './pages/HourlyPlanDetailsPage',
  './pages/HourlyPlanDetailsPrintablePage',
  'i18n!app/nls/hourlyPlans'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  HourlyPlan,
  HourlyPlanListPage,
  HourlyPlanAddFormPage,
  HourlyPlanEditFormPage,
  HourlyPlanDetailsPage,
  HourlyPlanDetailsPrintablePage
) {
  'use strict';

  var canView = user.auth('HOURLY_PLANS:VIEW');
  var canManage = user.auth('HOURLY_PLANS:MANAGE', 'PROD_DATA:MANAGE');

  router.map('/hourlyPlans', canView, function(req)
  {
    viewport.showPage(new HourlyPlanListPage({rql: req.rql}));
  });

  router.map('/hourlyPlans;add', canManage, function()
  {
    viewport.showPage(new HourlyPlanAddFormPage());
  });

  router.map('/hourlyPlans/:id', canView, function(req)
  {
    viewport.showPage(new HourlyPlanDetailsPage({modelId: req.params.id}));
  });

  router.map('/hourlyPlans/:id;edit', canManage, function(req)
  {
    viewport.showPage(new HourlyPlanEditFormPage({modelId: req.params.id}));
  });

  router.map('/hourlyPlans/:id;print', canView, function(req)
  {
    viewport.showPage(new HourlyPlanDetailsPrintablePage({modelId: req.params.id}));
  });

  router.map(
    '/hourlyPlans/:id;delete', canManage, showDeleteFormPage.bind(null, HourlyPlan)
  );
});
