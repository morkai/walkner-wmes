define(["../router","../viewport","../user"],function(r,e,n){"use strict";var i="css!app/xiconfOrders/assets/main",o="i18n!app/nls/xiconfOrders",s=n.auth("XICONF:VIEW");r.map("/xiconf/orders",s,function(r){e.loadPage(["app/xiconfOrders/XiconfOrderCollection","app/xiconfOrders/pages/XiconfOrderListPage",i,o],function(e,n){return new n({collection:new e(null,{rqlQuery:r.rql})})})}),r.map("/xiconf/orders/:id",s,function(r){e.loadPage(["app/xiconfOrders/XiconfOrder","app/xiconfOrders/pages/XiconfOrderDetailsPage","css!app/orders/assets/main",i,"i18n!app/nls/orders",o],function(e,n){return new n({model:new e({_id:r.params.id})})})})});