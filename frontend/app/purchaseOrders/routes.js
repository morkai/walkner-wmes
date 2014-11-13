// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  './PurchaseOrder',
  './pages/PurchaseOrderListPage',
  './pages/PurchaseOrderDetailsPage',
  './pages/QzPrintHelpPage',
  'i18n!app/nls/purchaseOrders'
], function(
  router,
  viewport,
  user,
  PurchaseOrder,
  PurchaseOrderListPage,
  PurchaseOrderDetailsPage,
  QzPrintHelpPage
) {
  'use strict';

  var canView = user.auth('PURCHASE_ORDERS:VIEW');

  router.map('/purchaseOrders', canView, function(req)
  {
    viewport.showPage(new PurchaseOrderListPage({
      rql: req.rql
    }));
  });

  router.map('/purchaseOrders/:id', canView, function(req)
  {
    viewport.showPage(new PurchaseOrderDetailsPage({
      model: new PurchaseOrder({_id: req.params.id}, {prints: true})
    }));
  });

  router.map('/purchaseOrders;qzPrintHelp', function()
  {
    viewport.showPage(new QzPrintHelpPage());
  });
});
