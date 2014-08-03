// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","i18n!app/nls/purchaseOrders"],function(r,e,a){var s=a.auth("PURCHASE_ORDERS:VIEW");r.map("/purchaseOrders",s,function(r){e.loadPage(["app/purchaseOrders/pages/PurchaseOrderListPage"],function(e){return new e({rql:r.rql})})}),r.map("/purchaseOrders/:id",s,function(r){e.loadPage(["app/purchaseOrders/PurchaseOrder","app/purchaseOrders/pages/PurchaseOrderDetailsPage"],function(e,a){return new a({model:new e({_id:r.params.id})})})})});