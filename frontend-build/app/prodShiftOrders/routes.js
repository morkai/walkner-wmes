// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user","../prodChangeRequests/util/createShowDeleteFormPage","./ProdShiftOrder"],function(r,e,d,t,i){"use strict";var a="i18n!app/nls/prodShiftOrders",o=d.auth("LOCAL","PROD_DATA:VIEW"),p=d.auth("PROD_DATA:MANAGE","PROD_DATA:CHANGES:REQUEST");r.map("/prodShiftOrders",o,function(r){e.loadPage(["app/prodShiftOrders/pages/ProdShiftOrderListPage",a],function(e){return new e({rql:r.rql})})}),r.map("/prodShiftOrders/:id",o,function(r){e.loadPage(["app/prodShiftOrders/pages/ProdShiftOrderDetailsPage",a],function(e){return new e({modelId:r.params.id})})}),r.map("/prodShiftOrders/:id;edit",p,function(r){e.loadPage(["app/prodShiftOrders/pages/EditProdShiftOrderFormPage",a],function(e){return new e({model:new i({_id:r.params.id})})})}),r.map("/prodShiftOrders/:id;delete",p,t(i))});