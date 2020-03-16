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

  var canView = user.auth('WH:VIEW');

  router.map('/wh/deliveredOrders', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wh-deliveredOrders/WhDeliveredOrderCollection',
        'app/wh-deliveredOrders/pages/ListPage',
        'i18n!app/nls/wh-deliveredOrders'
      ],
      function(WhDeliveredOrderCollection, ListPage)
      {
        return new ListPage({
          collection: new WhDeliveredOrderCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
