// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../user","../router","../viewport","i18n!app/nls/factoryLayout"],function(a,t,o){"use strict";var e=a.auth("PROD_DATA:VIEW"),r=a.auth("FACTORY_LAYOUT:MANAGE");t.map("/factoryLayout",function(){t.replace("/factoryLayout/default")}),t.map("/factoryLayout/:id",e,function(){o.loadPage(["app/factoryLayout/productionState","app/factoryLayout/pages/FactoryLayoutPage"],function(a,t){return new t({model:a})})}),t.map("/factoryLayout/:id;edit",r,function(a){o.loadPage(["app/factoryLayout/FactoryLayout","app/factoryLayout/pages/FactoryLayoutEditPage"],function(t,o){return new o({model:new t({_id:a.params.id})})})}),t.map("/factoryLayout;list",e,function(a){o.loadPage(["app/factoryLayout/productionState","app/factoryLayout/ProdLineStateDisplayOptions","app/factoryLayout/pages/ProdLineStateListPage","i18n!app/nls/prodShifts"],function(t,o,e){return new e({model:t,displayOptions:o.fromQuery(a.query)})})}),t.map("/factoryLayout;settings",r,function(a){o.loadPage(["app/factoryLayout/productionState","app/factoryLayout/pages/FactoryLayoutSettingsPage"],function(t,o){return new o({initialTab:a.query.tab,model:t})})})});