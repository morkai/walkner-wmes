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

  var nls = 'i18n!app/nls/sapLaborTimeFixer';
  var canView = user.auth('SAP_LABOR_TIME_FIXER:VIEW');

  router.map('/sapLaborTimeFixer', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/sapLaborTimeFixer/pages/SapLaborTimeFixerPage',
        nls
      ],
      function(SapLaborTimeFixerPage)
      {
        return new SapLaborTimeFixerPage();
      }
    );
  });
});
