// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../broker","../router","../viewport","../data/prodLines","../data/orgUnits","../prodShifts/ProdShift","./pages/ProductionPage","i18n!app/nls/production"],function(o,r,n,e,i,d,t){r.map("/production/*prodLineId",function(r){var p=e.get(r.params.prodLineId);return null==p?o.publish("router.404",r):void n.showPage(new t({model:new d(i.getAllForProdLine(p),{production:!0})}))})});