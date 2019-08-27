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

  router.map('/invalidOrders', user.auth('ORDERS:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/invalidOrders/InvalidOrderCollection',
        'app/invalidOrders/pages/InvalidOrderListPage',
        'css!app/invalidOrders/assets/main',
        'i18n!app/nls/invalidOrders'
      ],
      function(InvalidOrderCollection, InvalidOrderListPage)
      {
        return new InvalidOrderListPage({
          collection: new InvalidOrderCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
