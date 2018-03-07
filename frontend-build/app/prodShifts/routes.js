// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user","../data/orgUnits","../prodChangeRequests/util/createShowDeleteFormPage","./ProdShift"],function(e,t,i,o,d,r){"use strict";var a="i18n!app/nls/prodShifts",n=i.auth("PROD_DATA:VIEW"),p=i.auth("PROD_DATA:MANAGE","PROD_DATA:CHANGES:REQUEST");e.map("/prodShifts",n,function(e){t.loadPage(["app/prodShifts/ProdShiftCollection","app/prodShifts/pages/ProdShiftListPage",a],function(t,i){return new i({collection:new t(null,{rqlQuery:e.rql})})})}),e.map("/prodShifts;add",p,function(){t.loadPage(["app/prodShifts/pages/AddProdShiftFormPage",a],function(e){return new e({model:new r})})}),e.map("/prodShifts/:id",n,function(e){t.loadPage(["app/prodShifts/pages/ProdShiftDetailsPage","i18n!app/nls/prodShiftOrders","i18n!app/nls/prodDowntimes",a],function(t){return new t({latest:null!==o.getByTypeAndId("prodLine",e.params.id),modelId:e.params.id})})}),e.map("/prodShifts/:id;edit",p,function(e){t.loadPage(["app/prodShifts/pages/EditProdShiftFormPage",a],function(t){return new t({model:new r({_id:e.params.id})})})}),e.map("/prodShifts/:id;delete",p,d(r))});