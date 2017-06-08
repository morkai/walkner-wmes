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

  var nls = 'i18n!app/nls/invalidOrders';
  var canView = user.auth('ORDERS:VIEW');

  router.map('/invalidOrders', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/invalidOrders/InvalidOrderCollection',
        'app/invalidOrders/pages/InvalidOrderListPage',
        nls
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
