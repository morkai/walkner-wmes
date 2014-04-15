// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
