// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../router","../viewport","i18n!app/nls/factoryLayout"],function(a,t,o){t.map("/factoryLayout",function(){o.loadPage(["app/factoryLayout/productionState","app/factoryLayout/pages/FactoryLayoutPage"],function(a,t){return new t({model:a})})}),t.map("/factoryLayout/prodLines",function(a){o.loadPage(["app/factoryLayout/productionState","app/factoryLayout/pages/ProdLineStateListPage"],function(t,o){return new o({model:t,rqlQuery:a.rql})})})});