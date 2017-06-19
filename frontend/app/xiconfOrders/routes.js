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

  var nls = 'i18n!app/nls/xiconfOrders';
  var canView = user.auth('XICONF:VIEW');

  router.map('/xiconf/orders', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfOrders/XiconfOrderCollection',
        'app/xiconfOrders/pages/XiconfOrderListPage',
        nls
      ],
      function(XiconfOrderCollection, XiconfOrderListPage)
      {
        return new XiconfOrderListPage({
          collection: new XiconfOrderCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });

  router.map('/xiconf/orders/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfOrders/XiconfOrder',
        'app/xiconfOrders/pages/XiconfOrderDetailsPage',
        'i18n!app/nls/orders',
        nls
      ],
      function(XiconfOrder, XiconfOrderDetailsPage)
      {
        return new XiconfOrderDetailsPage({
          model: new XiconfOrder({_id: req.params.id})
        });
      }
    );
  });
});
