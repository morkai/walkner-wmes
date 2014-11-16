// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","./PurchaseOrder","./pages/PurchaseOrderListPage","./pages/PurchaseOrderDetailsPage","./pages/QzPrintHelpPage","i18n!app/nls/purchaseOrders"],function(e,r,a,s,n,p,i){var u=a.auth("PURCHASE_ORDERS:VIEW");e.map("/purchaseOrders",u,function(e){r.showPage(new n({rql:e.rql}))}),e.map("/purchaseOrders/:id",u,function(e){r.showPage(new p({model:new s({_id:e.params.id},{prints:!0})}))}),e.map("/purchaseOrders;qzPrintHelp",function(){r.showPage(new i)})});