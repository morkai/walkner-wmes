define([
  '../router',
  '../viewport',
  '../user',
  './pages/HourlyPlanListPage',
  './pages/CurrentHourlyPlanPage',
  './pages/HourlyPlanFormPage',
  './pages/HourlyPlanDetailsPage',
  './pages/HourlyPlanDetailsPrintablePage',
  'i18n!app/nls/hourlyPlans'
], function(
  router,
  viewport,
  user,
  HourlyPlanListPage,
  CurrentHourlyPlanPage,
  HourlyPlanFormPage,
  HourlyPlanDetailsPage,
  HourlyPlanDetailsPrintablePage
) {
  'use strict';

  var canView = user.auth('HOURLY_PLANS:VIEW');
  var canManage = user.auth('HOURLY_PLANS:MANAGE');

  router.map('/hourlyPlans', canView, function(req)
  {
    viewport.showPage(new HourlyPlanListPage({rql: req.rql}));
  });

  router.map('/hourlyPlans/:id', canView, function(req)
  {
    viewport.showPage(new HourlyPlanDetailsPage({modelId: req.params.id}));
  });

  router.map('/hourlyPlans/:id;edit', canManage, function(req)
  {
    viewport.showPage(new HourlyPlanFormPage({modelId: req.params.id}));
  });

  router.map('/hourlyPlans/:id;print', canView, function(req)
  {
    viewport.showPage(new HourlyPlanDetailsPrintablePage({modelId: req.params.id}));
  });

  router.map('/hourlyPlans/current', canManage, function()
  {
    viewport.showPage(new CurrentHourlyPlanPage());
  });
});
