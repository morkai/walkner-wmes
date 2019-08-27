// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user'
], function(
  _,
  router,
  viewport,
  user
) {
  'use strict';

  router.map('/logs/browserErrors', user.auth('SUPER'), function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/logs-browserErrors/BrowserErrorCollection',
        'app/logs-browserErrors/views/ListView',
        'css!app/logs-browserErrors/assets/main',
        'i18n!app/nls/logs-browserErrors'
      ],
      function(ListPage, Collection, ListView)
      {
        return new ListPage({
          actions: function() {},
          baseBreadcrumb: true,
          ListView: ListView,
          collection: new Collection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
