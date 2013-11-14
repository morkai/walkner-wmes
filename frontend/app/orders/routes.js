define([
  '../router',
  '../viewport',
  '../user',
  './pages/OrderListPage',
  './pages/OrderDetailsPage',
  'i18n!app/nls/orders'
], function(
  router,
  viewport,
  user,
  OrderListPage,
  OrderDetailsPage
) {
  'use strict';

  var canView = user.auth('ORDERS:VIEW');

  router.map('/orders', canView, function(req)
  {
    viewport.showPage(new OrderListPage({rql: req.rql}));
  });

  router.map('/orders/:id', function(req)
  {
    viewport.showPage(new OrderDetailsPage({modelId: req.params.id}));
  });
});
