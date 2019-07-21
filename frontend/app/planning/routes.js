// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../time',
  './Plan',
  './PlanSettings',
  './PlanSettingsCollection',
  './PlanChangesCollection',
  './pages/PlanPage',
  './pages/PlanListPage',
  './pages/PlanSettingsPage',
  './pages/PlanChangesPage',
  './pages/WhPage',
  'i18n!app/nls/planning'
], function(
  broker,
  router,
  viewport,
  user,
  time,
  Plan,
  PlanSettings,
  PlanSettingsCollection,
  PlanChangesCollection,
  PlanPage,
  PlanListPage,
  PlanSettingsPage,
  PlanChangesPage,
  WhPage
) {
  'use strict';

  var canView = user.auth('EMBEDDED', 'PLANNING:VIEW');
  var canManage = user.auth('PLANNING:MANAGE');
  var canViewWh = user.auth('WH:VIEW');

  router.map('/planning/settings/:id', canManage, function(req)
  {
    viewport.showPage(new PlanSettingsPage({
      model: new PlanSettings({_id: req.params.id}),
      back: req.query.back === '1'
    }));
  });

  router.map('/planning/changes', canView, function(req)
  {
    viewport.showPage(new PlanChangesPage({
      collection: new PlanChangesCollection(null, {
        rqlQuery: req.rql,
        paginate: false
      })
    }));
  });

  router.map('/planning/plans', canView, function(req)
  {
    viewport.showPage(new PlanListPage({
      collection: new PlanSettingsCollection(null, {
        rqlQuery: req.rql,
        paginate: false
      })
    }));
  });

  router.map('/planning/plans/:id', canView, function(req)
  {
    if (/^-?[0-9]+d$/.test(req.params.id))
    {
      req.params.id = time.getMoment()
        .subtract(time.getMoment().hours() < 6 ? 1 : 0, 'days')
        .startOf('day')
        .add(+req.params.id.replace('d', ''), 'days')
        .format('YYYY-MM-DD');

      broker.publish('router.navigate', {
        url: '/planning/plans/' + req.params.id,
        replace: true,
        trigger: false
      });
    }

    viewport.showPage(new PlanPage({
      date: req.params.id,
      mrps: req.query.mrps === undefined ? null : req.query.mrps
        .split(/[^A-Z0-9]+/i)
        .filter(function(mrp) { return mrp.length > 0; })
    }));
  });

  router.map('/planning/wh/:id', canViewWh, function(req)
  {
    if (/^-?[0-9]+d$/.test(req.params.id))
    {
      req.params.id = time.getMoment()
        .subtract(time.getMoment().hours() < 6 ? 1 : 0, 'days')
        .startOf('day')
        .add(+req.params.id.replace('d', ''), 'days')
        .format('YYYY-MM-DD');

      broker.publish('router.navigate', {
        url: '/planning/wh/' + req.params.id,
        replace: true,
        trigger: false
      });
    }

    var options = {
      date: req.params.id,
      mrps: req.query.mrps === undefined
        ? null
        : req.query.mrps.split(/[^A-Z0-9]+/i).filter(function(mrp) { return mrp.length > 0; }),
      from: req.query.from === undefined ? '06:00' : req.query.from,
      to: req.query.to === undefined ? '06:00' : req.query.to
    };

    ['lines', 'whStatuses', 'psStatuses'].forEach(function(prop)
    {
      options[prop] = req.query[prop] === undefined
        ? null
        : req.query[prop].split(',').filter(function(v) { return v.length > 0; });
    });

    viewport.showPage(new WhPage(options));
  });

  router.map('/planning/settings', canManage, function(req)
  {
    viewport.loadPage('app/planning/pages/PlanningSettingsPage', function(PlanningSettingsPage)
    {
      return new PlanningSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
