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

  var nls = 'i18n!app/nls/xiconf';
  var canView = user.auth('XICONF:VIEW');
  var canManage = user.auth('XICONF:MANAGE');

  router.map('/xiconf/results', canView, function(req)
  {
    viewport.loadPage([
      'app/xiconf/XiconfResultCollection',
      'app/xiconf/pages/XiconfResultListPage',
      nls
    ], function(
      XiconfResultCollection,
      XiconfResultListPage
    ) {
      return new XiconfResultListPage({
        collection: new XiconfResultCollection(null, {rqlQuery: req.rql})
      });
    });
  });

  router.map('/xiconf/results/:id', canView, function(req)
  {
    viewport.loadPage([
      'app/xiconf/pages/XiconfResultDetailsPage',
      'i18n!app/nls/xiconfPrograms',
      nls
    ], function(XiconfResultDetailsPage)
    {
      return new XiconfResultDetailsPage({
        modelId: req.params.id,
        tab: req.query.tab
      });
    });
  });

  router.map('/xiconf;settings', canManage, function(req)
  {
    viewport.loadPage([
      'app/xiconf/pages/XiconfSettingsPage',
      nls
    ], function(XiconfSettingsPage)
    {
      return new XiconfSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
