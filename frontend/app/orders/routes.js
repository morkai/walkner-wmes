define([
  'app/router',
  'app/viewport',
  'app/user',
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
  var canManage = user.auth('ORDERS:MANAGE');

  router.map('/orders', canView, function showOrderListPage(req)
  {
    viewport.showPage(new OrderListPage({rql: req.rql}));
  });

  router.map('/orders/:id', function showOrderDetailsPage(req)
  {
    viewport.showPage(new OrderDetailsPage({orderId: req.params.id}));
  });
});
