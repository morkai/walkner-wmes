// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  'i18n!app/nls/xiconf'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('XICONF:VIEW');

  router.map('/xiconf/results', canView, function(req)
  {
    viewport.loadPage(['app/xiconf/pages/XiconfResultListPage'], function(XiconfResultListPage)
    {
      return new XiconfResultListPage({rql: req.rql});
    });
  });

  router.map('/xiconf/results/:id', canView, function(req)
  {
    viewport.loadPage(
      ['app/xiconf/pages/XiconfResultDetailsPage'],
      function(XiconfResultDetailsPage)
      {
        return new XiconfResultDetailsPage({
          modelId: req.params.id,
          tab: req.query.tab
        });
      }
    );
  });
});
