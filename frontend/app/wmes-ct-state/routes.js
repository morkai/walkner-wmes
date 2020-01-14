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

  var css = 'css!app/wmes-ct-state/assets/main';
  var nls = 'i18n!app/nls/wmes-ct-state';
  var canView = user.auth('PROD_DATA:VIEW');
  var canManage = user.auth('PROD_DATA:MANAGE');

  router.map('/ct', canView, function()
  {
    viewport.loadPage(
      [
        'app/wmes-ct-state/LineStateCollection',
        'app/wmes-ct-state/pages/ListPage',
        css,
        nls
      ],
      function(LineStateCollection, ListPage)
      {
        return new ListPage({
          collection: new LineStateCollection()
        });
      }
    );
  });

  router.map('/ct/diag', canManage, function()
  {
    viewport.loadPage(
      [
        'app/wmes-ct-state/pages/DiagPage',
        css,
        nls
      ],
      function(DiagPage)
      {
        return new DiagPage();
      }
    );
  });

  router.map('/ct/settings', canManage, function(req)
  {
    viewport.loadPage(['app/wmes-ct-state/pages/SettingsPage', nls], function(SettingsPage)
    {
      return new SettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
