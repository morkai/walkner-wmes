// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../time',
  '../core/util/showDeleteFormPage',
  '../core/util/getRelativeDateRange',
  '../core/util/fixRelativeDateInRql',
  './HourlyPlan',
  './HourlyPlanCollection'
], function(
  broker,
  router,
  viewport,
  user,
  time,
  showDeleteFormPage,
  getRelativeDateRange,
  fixRelativeDateInRql,
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
          collection: new HourlyPlanCollection(null, {
            rqlQuery: fixRelativeDateInRql(req.rql, {
              property: 'date',
              range: true,
              shift: true
            })
          })
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

  router.map('/hourlyPlans;settings', user.auth('PROD_DATA:MANAGE'), function(req)
  {
    viewport.loadPage(['app/hourlyPlans/pages/PlanningSettingsPage', nls], function(QiSettingsPage)
    {
      return new QiSettingsPage({
        initialTab: req.query.tab
      });
    });
  });

  router.map('/hourlyPlans;planning', canManage, function(req)
  {
    broker.publish('router.navigate', {
      url: '/dailyMrpPlans?' + req.rql,
      replace: true,
      trigger: true
    });
  });

  router.map('/dailyMrpPlans;list', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/hourlyPlans/DailyMrpPlanCollection',
        'app/hourlyPlans/pages/DailyMrpPlanListPage',
        nls
      ],
      function(DailyMrpPlanCollection, DailyMrpPlanListPage)
      {
        return new DailyMrpPlanListPage({
          collection: new DailyMrpPlanCollection(null, {
            rqlQuery: req.rql,
            paginate: false
          })
        });
      }
    );
  });

  router.map('/dailyMrpPlans', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/hourlyPlans/settings',
        'app/hourlyPlans/DailyMrpPlanCollection',
        'app/hourlyPlans/pages/PlanningPage',
        nls
      ],
      function(settings, DailyMrpPlanCollection, PlanningPage)
      {
        return new PlanningPage({
          model: new DailyMrpPlanCollection(null, {
            settings: settings.acquire(),
            rqlQuery: fixRelativeDateInRql(req.rql, {
              property: 'date',
              shift: true,
              format: 'YYYY-MM-DD'
            }),
            paginate: false
          })
        });
      }
    );
  });

  router.map('/hourlyPlans;add', canManage, function(req)
  {
    viewport.loadPage(['app/hourlyPlans/pages/HourlyPlanAddFormPage', nls], function(HourlyPlanAddFormPage)
    {
      var dateRange = getRelativeDateRange(req.query.date);

      return new HourlyPlanAddFormPage({
        model: new HourlyPlan({
          date: dateRange ? dateRange.from.setHours(6) : null
        })
      });
    });
  });

  router.map('/hourlyPlans/:date/:division', canView, function(req)
  {
    var date = req.params.date;
    var hourlyPlans = new HourlyPlanCollection(null, {
      rqlQuery: 'select(_id)&date=' + date + '&division=' + req.params.division
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
          + '&date>=' + date
          + '&date<' + time.getMoment(/^[0-9]+$/.test(date) ? +date : date).add(1, 'days').valueOf()
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
