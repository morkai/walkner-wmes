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
  HourlyPlanCollection
) {
  'use strict';

  var css = 'css!app/hourlyPlans/assets/main';
  var nls = 'i18n!app/nls/hourlyPlans';
  var canView = user.auth('HOURLY_PLANS:VIEW');
  var canManage = user.auth('HOURLY_PLANS:MANAGE', 'PROD_DATA:MANAGE');

  router.map('/hourlyPlans', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/hourlyPlans/pages/HourlyPlanListPage',
        'i18n!app/nls/fte',
        nls
      ],
      function(HourlyPlanListPage)
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

  router.map('/hourlyPlans;settings', user.auth('PROD_DATA:MANAGE'), function(req)
  {
    viewport.loadPage(['app/hourlyPlans/pages/PlanningSettingsPage', nls], function(PlanningSettingsPage)
    {
      return new PlanningSettingsPage({
        initialTab: req.query.tab
      });
    });
  });

  router.map('/hourlyPlans;add', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/hourlyPlans/HourlyPlan',
        'app/hourlyPlans/pages/HourlyPlanAddFormPage',
        nls
      ],
      function(HourlyPlan, HourlyPlanAddFormPage)
      {
        var dateRange = getRelativeDateRange(req.query.date);

        return new HourlyPlanAddFormPage({
          model: new HourlyPlan({
            date: dateRange ? dateRange.from.setHours(6) : null
          })
        });
      }
    );
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
        url: '/hourlyPlans?sort(-date)&limit(-1337)'
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
    viewport.loadPage(
      [
        'app/hourlyPlans/HourlyPlan',
        'app/hourlyPlans/pages/HourlyPlanDetailsPage',
        css,
        nls
      ],
      function(HourlyPlan, HourlyPlanDetailsPage)
      {
        return new HourlyPlanDetailsPage({
          model: new HourlyPlan({_id: req.params.id})
        });
      }
    );
  });

  router.map('/hourlyPlans/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/hourlyPlans/HourlyPlan',
        'app/hourlyPlans/pages/HourlyPlanEditFormPage',
        css,
        nls
      ],
      function(HourlyPlan, HourlyPlanEditFormPage)
      {
        return new HourlyPlanEditFormPage({
          model: new HourlyPlan({_id: req.params.id})
        });
      }
    );
  });

  router.map('/hourlyPlans/:id;delete', canManage, showDeleteFormPage.bind(null, 'app/hourlyPlans/HourlyPlan'));
});
