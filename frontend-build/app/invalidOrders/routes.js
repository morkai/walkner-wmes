// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user"],function(r,e,n){"use strict";var i="i18n!app/nls/invalidOrders",a=n.auth("ORDERS:VIEW");r.map("/invalidOrders",a,function(r){e.loadPage(["app/invalidOrders/InvalidOrderCollection","app/invalidOrders/pages/InvalidOrderListPage",i],function(e,n){return new n({collection:new e(null,{rqlQuery:r.rql})})})})});