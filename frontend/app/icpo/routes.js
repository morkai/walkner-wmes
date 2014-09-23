// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
