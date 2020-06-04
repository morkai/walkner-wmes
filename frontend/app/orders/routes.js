// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './pages/OrderListPage',
  'app/orders/pages/OrderDetailsPage',
  'css!app/orders/assets/main',
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

  router.map('/orders', canView, function(req)
  {
    viewport.showPage(new OrderListPage({rql: req.rql}));
  });

  router.map('/orders/:id', function(req)
  {
    viewport.showPage(new OrderDetailsPage({modelId: req.params.id}));
  });

  router.map('/orders;settings', canManage, function(req)
  {
    viewport.loadPage(['app/orders/pages/OrderSettingsPage'], function(OrderSettingsPage)
    {
      return new OrderSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
