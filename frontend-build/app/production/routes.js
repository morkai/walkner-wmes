// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../broker","../router","../viewport","../user","../data/orgUnits","../prodShifts/ProdShift","./pages/ProductionPage","i18n!app/nls/production","i18n!app/nls/isa"],function(n,o,i,r,t,e,p){"use strict";o.map("/production/*prodLineId",function(o){var r=t.getByTypeAndId("prodLine",o.params.prodLineId);return null==r?n.publish("router.404",o):void i.showPage(new p({model:new e(t.getAllForProdLine(r),{production:!0})}))}),o.map("/production;settings",r.auth("PROD_DATA:MANAGE"),function(n){i.loadPage(["app/production/pages/ProductionSettingsPage"],function(o){return new o({initialTab:n.query.tab})})})});