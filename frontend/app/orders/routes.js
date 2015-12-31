// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  var nls = 'i18n!app/nls/orders';
  var canView = user.auth('ORDERS:VIEW');
  var canManage = user.auth('ORDERS:MANAGE');

  router.map('/orders', canView, function(req)
  {
    viewport.loadPage(['app/orders/pages/OrderListPage', nls], function(OrderListPage)
    {
      return new OrderListPage({rql: req.rql});
    });
  });

  router.map('/orders/:id', function(req)
  {
    viewport.loadPage(['app/orders/pages/OrderDetailsPage', nls], function(OrderDetailsPage)
    {
      return new OrderDetailsPage({modelId: req.params.id});
    });
  });

  router.map('/orders;settings', canManage, function(req)
  {
    viewport.loadPage(['app/orders/pages/OrderSettingsPage', nls], function(OrderSettingsPage)
    {
      return new OrderSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
