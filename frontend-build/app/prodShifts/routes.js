define(["../router","../viewport","../user","./ProdShift","./pages/ProdShiftListPage","i18n!app/nls/prodShifts"],function(i,t,a,e,o){var r=a.auth("PROD_DATA:VIEW");i.map("/prodShifts",r,function(i){t.showPage(new o({rql:i.rql}))}),i.map("/prodShifts/:id",r,function(i){t.loadPage("app/prodShifts/pages/ProdShiftDetailsPage",function(t){return new t({modelId:i.params.id})})}),i.map("/prodShifts/:id;edit",a.auth("PROD_DATA:MANAGE"),function(i){t.loadPage(["app/prodShifts/pages/EditProdShiftFormPage"],function(t){return new t({model:new e({_id:i.params.id})})})})});