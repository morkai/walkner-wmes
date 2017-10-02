// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../time'
], function(
  broker,
  router,
  viewport,
  user,
  time
) {
  'use strict';

  var nls = 'i18n!app/nls/planning';
  var canView = user.auth('PLANNING:VIEW');
  var canManage = user.auth('PLANNING:MANAGE');

  router.map('/planning/settings/:id', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/planning/PlanSettings',
        'app/planning/pages/PlanSettingsPage',
        nls
      ],
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
      [
        'app/planning/PlanChangesCollection',
        'app/planning/pages/PlanChangesPage',
        nls
      ],
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
      [
        'app/planning/PlanSettingsCollection',
        'app/planning/pages/PlanListPage',
        nls
      ],
      function(PlanSettingsCollection, PlanListPage)
      {
        return new PlanListPage({
          collection: new PlanSettingsCollection(null, {
            rqlQuery: req.rql,
            paginate: false
          })
        });
      }
    );
  });

  router.map('/planning/plans/:id', canView, function(req)
  {
    if (/^[0-9]+d$/.test(req.params.id))
    {
      req.params.id = time.utc.getMoment()
        .startOf('day')
        .add(req.params.id.replace('d', ''), 'days')
        .format('YYYY-MM-DD');

      broker.publish('router.navigate', {
        url: '/planning/plans/' + req.params.id,
        replace: true,
        trigger: false
      });
    }

    viewport.loadPage(
      [
        'app/planning/Plan',
        'app/planning/pages/PlanPage',
        nls
      ],
      function(Plan, PlanPage)
      {
        return new PlanPage({
          date: req.params.id,
          mrps: req.query.mrps === undefined ? null : req.query.mrps
            .split(/[^A-Z0-9]+/)
            .filter(function(mrp) { return mrp.length > 0; })
        });
      }
    );
  });

  viewport.once('afterRender', toggleNavbarPlanning2D);

  function toggleNavbarPlanning2D()
  {
    var navbarView = viewport.currentLayout.getView('.navbar');

    if (navbarView)
    {
      navbarView.$id('planning-2d').toggleClass('disabled', time.getMoment().hours() < 17);
    }

    setTimeout(toggleNavbarPlanning2D, 60000);
  }
});
