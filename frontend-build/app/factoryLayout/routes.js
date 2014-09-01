// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../router","../viewport","i18n!app/nls/factoryLayout"],function(t,o,a){o.map("/factoryLayout",function(){a.loadPage(["app/factoryLayout/productionState","app/factoryLayout/pages/FactoryLayoutPage"],function(t,o){return new o({model:t})})}),o.map("/factoryLayout/prodLines",function(t){a.loadPage(["app/factoryLayout/productionState","app/factoryLayout/ProdLineStateListOptions","app/factoryLayout/pages/ProdLineStateListPage"],function(o,a,e){return new e({model:o,listOptions:a.fromQuery(t.query)})})})});