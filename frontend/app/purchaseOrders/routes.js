// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  'i18n!app/nls/purchaseOrders'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('PURCHASE_ORDERS:VIEW');

  router.map('/purchaseOrders', canView, function(req)
  {
    viewport.loadPage(
      ['app/purchaseOrders/pages/PurchaseOrderListPage'],
      function(PurchaseOrderListPage)
      {
        return new PurchaseOrderListPage({rql: req.rql});
      }
    );
  });

  router.map('/purchaseOrders/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/purchaseOrders/PurchaseOrder',
        'app/purchaseOrders/pages/PurchaseOrderDetailsPage'
      ],
      function(PurchaseOrder, PurchaseOrderDetailsPage)
      {
        return new PurchaseOrderDetailsPage({
          model: new PurchaseOrder({_id: req.params.id})
        });
      }
    );
  });
});
