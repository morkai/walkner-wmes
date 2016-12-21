// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../time',
  '../core/util/showDeleteFormPage',
  './HourlyPlan',
  './HourlyPlanCollection'
], function(
  broker,
  router,
  viewport,
  user,
  time,
  showDeleteFormPage,
  HourlyPlan,
  HourlyPlanCollection
) {
  'use strict';

  var nls = 'i18n!app/nls/hourlyPlans';
  var canView = user.auth('HOURLY_PLANS:VIEW');
  var canManage = user.auth('HOURLY_PLANS:MANAGE', 'PROD_DATA:MANAGE');

  router.map('/hourlyPlans', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/hourlyPlans/HourlyPlanCollection',
        'app/hourlyPlans/pages/HourlyPlanListPage',
        'i18n!app/nls/fte',
        nls
      ],
      function(HourlyPlanCollection, HourlyPlanListPage)
      {
        return new HourlyPlanListPage({
          collection: new HourlyPlanCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/hourlyPlans;heff', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/hourlyPlans/HeffLineStateCollection',
        'app/hourlyPlans/pages/HeffLineStatePage',
        nls
      ],
      function(HeffLineStateCollection, HeffLineStatePage)
      {
        return new HeffLineStatePage({
          collection: new HeffLineStateCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/hourlyPlans;add', canManage, function()
  {
    viewport.loadPage(['app/hourlyPlans/pages/HourlyPlanAddFormPage', nls], function(HourlyPlanAddFormPage)
    {
      return new HourlyPlanAddFormPage();
    });
  });

  router.map('/hourlyPlans/:date/:division', canView, function(req)
  {
    var hourlyPlans = new HourlyPlanCollection(null, {
      rqlQuery: 'select(_id)&date=' + req.params.date + '&division=' + req.params.division
    });

    hourlyPlans.on('error', showListPage);

    hourlyPlans.on('sync', function()
    {
      if (hourlyPlans.length === 1)
      {
        broker.publish('router.navigate', {
          url: '/hourlyPlans/' + hourlyPlans.models[0].id,
          trigger: true,
          replace: true
        });
      }
      else
      {
        showListPage();
      }
    });

    hourlyPlans.fetch({reset: true});

    function showListPage()
    {
      broker.publish('router.navigate', {
        url: '/hourlyPlans?sort(-date)&limit(20)'
          + '&date>=' + req.params.date
          + '&date<' + time.getMoment(+req.params.date).add(1, 'days').valueOf()
          + '&division=' + req.params.division,
        trigger: true,
        replace: true
      });
    }
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
