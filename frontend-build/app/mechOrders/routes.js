// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user"],function(e,r,n){"use strict";var a="i18n!app/nls/mechOrders",s=n.auth("ORDERS:VIEW");e.map("/mechOrders",s,function(e){r.loadPage(["app/mechOrders/pages/MechOrderListPage",a],function(r){return new r({rql:e.rql})})}),e.map("/mechOrders/:id",s,function(e){r.loadPage(["app/mechOrders/pages/MechOrderDetailsPage","i18n!app/nls/orders","i18n!app/nls/mechOrders"],function(r){return new r({modelId:e.params.id})})})});