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

  var css = 'css!app/orders/assets/main';
  var nls = 'i18n!app/nls/orders';
  var canView = user.auth('ORDERS:VIEW');
  var canManage = user.auth('ORDERS:MANAGE');

  router.map('/orders', canView, function(req)
  {
    viewport.loadPage(['app/orders/pages/OrderListPage', css, nls], function(OrderListPage)
    {
      return new OrderListPage({rql: req.rql});
    });
  });

  router.map('/orders/:id', function(req)
  {
    viewport.loadPage(['app/orders/pages/OrderDetailsPage', css, nls], function(OrderDetailsPage)
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
