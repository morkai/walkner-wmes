// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './HourlyPlan'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  HourlyPlan
) {
  'use strict';

  var nls = 'i18n!app/nls/hourlyPlans';
  var canView = user.auth('HOURLY_PLANS:VIEW');
  var canManage = user.auth('HOURLY_PLANS:MANAGE', 'PROD_DATA:MANAGE');

  router.map('/hourlyPlans', canView, function(req)
  {
    viewport.loadPage(['app/hourlyPlans/pages/HourlyPlanListPage', nls], function(HourlyPlanListPage)
    {
      return new HourlyPlanListPage({rql: req.rql});
    });
  });

  router.map('/hourlyPlans;add', canManage, function()
  {
    viewport.loadPage(['app/hourlyPlans/pages/HourlyPlanAddFormPage', nls], function(HourlyPlanAddFormPage)
    {
      return new HourlyPlanAddFormPage();
    });
  });

  router.map('/hourlyPlans/:id', canView, function(req)
  {
    viewport.loadPage(['app/hourlyPlans/pages/HourlyPlanDetailsPage', nls], function(HourlyPlanDetailsPage)
    {
      return new HourlyPlanDetailsPage({modelId: req.params.id});
    });
  });

  router.map('/hourlyPlans/:id;edit', canManage, function(req)
  {
    viewport.loadPage(['app/hourlyPlans/pages/HourlyPlanEditFormPage', nls], function(HourlyPlanEditFormPage)
    {
      return new HourlyPlanEditFormPage({modelId: req.params.id});
    });
  });

  router.map('/hourlyPlans/:id;print', canView, function(req)
  {
    viewport.loadPage(
      ['app/hourlyPlans/pages/HourlyPlanDetailsPrintablePage', nls],
      function(HourlyPlanDetailsPrintablePage)
      {
        return new HourlyPlanDetailsPrintablePage({modelId: req.params.id});
      }
    );
  });

  router.map('/hourlyPlans/:id;delete', canManage, showDeleteFormPage.bind(null, HourlyPlan));

});
