define(["../router","../viewport","../user"],function(e,r,t){"use strict";var p="css!app/emptyOrders/assets/main",n="i18n!app/nls/emptyOrders",a=t.auth("ORDERS:VIEW");e.map("/emptyOrders",a,function(e){r.loadPage(["app/emptyOrders/pages/EmptyOrderListPage",p,n],function(r){return new r({rql:e.rql})})}),e.map("/emptyOrders;print",a,function(e){r.loadPage(["app/emptyOrders/pages/EmptyOrderPrintableListPage",p,n],function(r){return new r({rql:e.rql})})})});