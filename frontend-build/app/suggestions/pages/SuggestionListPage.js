define(["app/i18n","app/core/pages/FilteredListPage","app/core/util/pageActions","app/kaizenOrders/dictionaries","../views/SuggestionFilterView","../views/SuggestionListView"],function(e,t,i,n,o,r){"use strict";return t.extend({baseBreadcrumb:!0,FilterView:o,ListView:r,actions:function(t){var n=this.collection;return[i.jump(this,n),i.export(t,this,this.collection,!1),{label:e.bound(n.getNlsDomain(),"PAGE_ACTION:add"),icon:"plus",href:n.genClientUrl("add")}]},load:function(e){return e(this.collection.fetch({reset:!0}),n.load())},destroy:function(){t.prototype.destroy.call(this),n.unload()},afterRender:function(){t.prototype.afterRender.call(this),n.load()}})});