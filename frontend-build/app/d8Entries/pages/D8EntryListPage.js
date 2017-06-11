// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/FilteredListPage","app/core/util/pageActions","../dictionaries","../views/D8EntryFilterView","../views/D8EntryListView"],function(e,t,i,n,r,o){"use strict";return t.extend({baseBreadcrumb:!0,FilterView:r,ListView:o,actions:function(t){var n=this.collection;return[i.jump(this,n),i.export(t,this,this.collection,!1),{label:e.bound(n.getNlsDomain(),"PAGE_ACTION:add"),icon:"plus",privileges:"D8:MANAGE",href:n.genClientUrl("add")}]},load:function(e){return e(this.collection.fetch({reset:!0}),n.load())},destroy:function(){t.prototype.destroy.call(this),n.unload()},afterRender:function(){t.prototype.afterRender.call(this),n.load()}})});