define(["../router","../viewport","../user"],function(e,r,n){"use strict";var a=n.auth("ORDERS:VIEW");e.map("/mechOrders",a,function(e){r.loadPage(["app/mechOrders/pages/MechOrderListPage","i18n!app/nls/mechOrders"],function(r){return new r({rql:e.rql})})}),e.map("/mechOrders/:id",a,function(e){r.loadPage(["app/mechOrders/pages/MechOrderDetailsPage","i18n!app/nls/orders","i18n!app/nls/mechOrders"],function(r){return new r({modelId:e.params.id})})})});