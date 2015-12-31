// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  'i18n!app/nls/icpo'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('ICPO:VIEW');

  router.map('/icpo/results', canView, function(req)
  {
    viewport.loadPage(['app/icpo/pages/IcpoResultListPage'], function(IcpoResultListPage)
    {
      return new IcpoResultListPage({rql: req.rql});
    });
  });

  router.map('/icpo/results/:id', canView, function(req)
  {
    viewport.loadPage(
      ['app/icpo/pages/IcpoResultDetailsPage'],
      function(IcpoResultDetailsPage)
      {
        return new IcpoResultDetailsPage({modelId: req.params.id});
      }
    );
  });
});
