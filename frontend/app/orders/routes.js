// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  'i18n!app/nls/orders'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('ORDERS:VIEW');
  var canManage = user.auth('ORDERS:MANAGE');

  router.map('/orders', canView, function(req)
  {
    viewport.loadPage(['app/orders/pages/OrderListPage'], function(OrderListPage)
    {
      return new OrderListPage({rql: req.rql});
    });
  });

  router.map('/orders/:id', function(req)
  {
    viewport.loadPage(['app/orders/pages/OrderDetailsPage'], function(OrderDetailsPage)
    {
      return new OrderDetailsPage({modelId: req.params.id});
    });
  });

  router.map('/orders;settings', canManage, function(req)
  {
    viewport.loadPage('app/orders/pages/OrderSettingsPage', function(OrderSettingsPage)
    {
      return new OrderSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
