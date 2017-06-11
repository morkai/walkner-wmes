// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/FilteredListPage","app/core/util/pageActions","app/kaizenOrders/dictionaries","../views/BehaviorObsCardFilterView","../views/BehaviorObsCardListView"],function(e,t,i,r,o,n){"use strict";return t.extend({baseBreadcrumb:!0,FilterView:o,ListView:n,actions:function(t){var r=this.collection;return[i.jump(this,r),i.export(t,this,this.collection),{label:e.bound(r.getNlsDomain(),"PAGE_ACTION:add"),icon:"plus",href:r.genClientUrl("add")}]},load:function(e){return e(this.collection.fetch({reset:!0}),r.load())},destroy:function(){t.prototype.destroy.call(this),r.unload()},afterRender:function(){t.prototype.afterRender.call(this),r.load()}})});