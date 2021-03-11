// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../time'
], function(
  $,
  broker,
  router,
  viewport,
  user,
  time
) {
  'use strict';

  var css = ['css!app/planning/assets/main', 'css!app/paintShop/assets/main'];
  var nls = ['i18n!app/nls/planning', 'i18n!app/nls/paintShop'];
  var canView = user.auth('EMBEDDED', 'PLANNING:VIEW');
  var canManage = user.auth('PLANNING:MANAGE');
  var canViewWh = user.auth('WH:VIEW');

  router.map('/planning/settings/:id', canManage, function(req)
  {
    viewport.loadPage(
      ['app/planning/PlanSettings', 'app/planning/pages/PlanSettingsPage', css[0], nls[0]],
      function(PlanSettings, PlanSettingsPage)
      {
        return new PlanSettingsPage({
          model: new PlanSettings({_id: req.params.id}),
          back: req.query.back === '1'
        });
      }
    );
  });

  router.map('/planning/changes', canView, function(req)
  {
    viewport.loadPage(
      ['app/planning/PlanChangesCollection', 'app/planning/pages/PlanChangesPage', css[0], nls[0]],
      function(PlanChangesCollection, PlanChangesPage)
      {
        return new PlanChangesPage({
          collection: new PlanChangesCollection(null, {
            rqlQuery: req.rql,
            paginate: false
          })
        });
      }
    );
  });

  router.map('/planning/plans', canView, function(req)
  {
    viewport.loadPage(
      ['app/planning/PlanStatsCollection', 'app/planning/pages/PlanListPage'].concat(css, nls),
      function(PlanStatsCollection, PlanListPage)
      {
        return new PlanListPage({
          collection: PlanStatsCollection.fromQuery(req.query)
        });
      }
    );
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

    viewport.loadPage(
      ['app/planning/pages/PlanPage'].concat(css, nls),
      function(PlanPage)
      {
        return new PlanPage({
          date: req.params.id,
          mrps: req.query.mrps === undefined ? null : req.query.mrps
            .split(/[^A-Z0-9]+/i)
            .filter(function(mrp) { return mrp.length > 0; }),
          division: req.query.division || null,
          order: req.query.order
        });
      }
    );
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

    viewport.loadPage(
      ['app/planning/pages/WhPage'].concat(css, nls),
      function(WhPage)
      {
        return new WhPage(options);
      }
    );
  });

  router.map('/planning/settings', canManage, function(req)
  {
    viewport.loadPage(
      ['app/planning/pages/PlanningSettingsPage', css[0], nls[0]],
      function(PlanningSettingsPage)
      {
        return new PlanningSettingsPage({
          initialTab: req.query.tab
        });
      }
    );
  });

  router.map('/planning;jump-to-order', canView, function(req)
  {
    viewport.msg.loading();

    var orderNo = req.query.order;

    var orderReq = $.ajax({url: '/orders/' + orderNo + '?select(mrp,scheduledStartDate)'});

    orderReq.fail(function()
    {
      viewport.msg.loaded();

      broker.publish('viewport.page.loadingFailed', {
        page: null,
        xhr: orderReq
      });
    });

    orderReq.done(function(order)
    {
      viewport.msg.loaded();

      var plan = time.getMoment(order.scheduledStartDate).format('YYYY-MM-DD');

      broker.publish('router.navigate', {
        url: '/planning/plans/' + plan + '?mrps=' + order.mrp + '&order=' + orderNo,
        trigger: true,
        replace: true
      });
    });
  });
});
