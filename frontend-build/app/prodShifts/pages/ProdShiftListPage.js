// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/core/util/pageActions","app/core/pages/FilteredListPage","../views/ProdShiftListView","../views/ProdShiftFilterView"],function(i,e,t,o,s){"use strict";return t.extend({FilterView:s,ListView:o,actions:function(t){return[e["export"](t,this,this.collection),e.add(this.collection,i.isAllowedTo.bind(i,"PROD_DATA:MANAGE","PROD_DATA:CHANGES:REQUEST"))]}})});