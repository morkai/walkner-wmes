// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../router","../viewport","i18n!app/nls/factoryLayout"],function(a,t,o){t.map("/factoryLayout",function(){t.replace("/factoryLayout/default")}),t.map("/factoryLayout/:id",function(){o.loadPage(["app/factoryLayout/productionState","app/factoryLayout/pages/FactoryLayoutPage"],function(a,t){return new t({model:a})})}),t.map("/factoryLayout/:id;edit",function(a){o.loadPage(["app/factoryLayout/FactoryLayout","app/factoryLayout/pages/FactoryLayoutEditPage"],function(t,o){return new o({model:new t({_id:a.params.id})})})}),t.map("/factoryLayout;list",function(a){o.loadPage(["app/factoryLayout/productionState","app/factoryLayout/ProdLineStateDisplayOptions","app/factoryLayout/pages/ProdLineStateListPage"],function(t,o,e){return new e({model:t,displayOptions:o.fromQuery(a.query)})})}),t.map("/factoryLayout;settings",a.auth("FACTORY_LAYOUT:MANAGE"),function(a){o.loadPage(["app/factoryLayout/productionState","app/factoryLayout/pages/FactoryLayoutSettingsPage"],function(t,o){return new o({initialTab:a.query.tab,model:t})})})});