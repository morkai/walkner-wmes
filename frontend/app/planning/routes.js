// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var nls = 'i18n!app/nls/planning';
  var canView = user.auth('HOURLY_PLANS:VIEW', 'PROD_DATA:VIEW');

  router.map('/planning/settings/:id', canView, function(req)
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
          model: new PlanSettings({_id: req.params.id})
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
});
