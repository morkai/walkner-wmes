// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../time'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var nls = 'i18n!app/nls/planning';
  var canView = user.auth('USER');

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
});
