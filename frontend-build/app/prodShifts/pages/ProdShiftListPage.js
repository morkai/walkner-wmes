define(["app/user","app/core/util/pageActions","app/core/pages/FilteredListPage","../views/ProdShiftListView","../views/ProdShiftFilterView"],function(i,e,t,o,s){"use strict";return t.extend({FilterView:s,ListView:o,actions:function(t){return[e.export(t,this,this.collection),e.add(this.collection,i.isAllowedTo.bind(i,"PROD_DATA:MANAGE","PROD_DATA:CHANGES:REQUEST"))]}})});