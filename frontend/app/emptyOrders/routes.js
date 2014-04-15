// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  './pages/EmptyOrderListPage',
  './pages/EmptyOrderPrintableListPage',
  'i18n!app/nls/emptyOrders'
], function(
  router,
  viewport,
  user,
  EmptyOrderListPage,
  EmptyOrderPrintableListPage
) {
  'use strict';

  var canView = user.auth('ORDERS:VIEW');

  router.map('/emptyOrders', canView, function(req)
  {
    viewport.showPage(new EmptyOrderListPage({rql: req.rql}));
  });

  router.map('/emptyOrders;print', canView, function(req)
  {
    viewport.showPage(new EmptyOrderPrintableListPage({rql: req.rql}));
  });
});
