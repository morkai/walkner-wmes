define(["app/core/pages/FilteredListPage","app/core/util/pageActions","app/wmes-osh-common/dictionaries","../views/FilterView","../views/ListView"],function(i,t,e,o,n){"use strict";return i.extend({FilterView:o,ListView:n,actions:function(i){return[t.jump(this,this.collection,{mode:"id"}),t.add(this.collection,!1),t.export(i,this,this.collection,!1)]},initialize:function(){i.prototype.initialize.apply(this,arguments),e.bind(this)}})});