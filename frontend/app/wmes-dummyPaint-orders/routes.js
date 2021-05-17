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

  var canView = user.auth('DUMMY_PAINT:VIEW');
  var canManage = user.auth('DUMMY_PAINT:MANAGE');

  router.map('/dummyPaint/orders', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-dummyPaint-orders/dictionaries',
        'app/wmes-dummyPaint-orders/DpOrderCollection',
        'app/wmes-dummyPaint-orders/pages/ListPage',
        'i18n!app/nls/wmes-dummyPaint-orders',
        'css!app/wmes-dummyPaint-orders/assets/main'
      ],
      function(dictionaries, DpOrderCollection, ListPage)
      {
        return dictionaries.bind(new ListPage({
          collection: new DpOrderCollection(null, {rqlQuery: req.rql})
        }));
      }
    );
  });

  router.map('/dummyPaint/settings', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-dummyPaint-orders/pages/SettingsPage',
        'i18n!app/nls/wmes-dummyPaint-orders'
      ],
      function(SettingsPage)
      {
        return new SettingsPage({
          initialTab: req.query.tab
        });
      }
    );
  });
});
