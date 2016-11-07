// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/user","app/core/pages/FilteredListPage","app/core/util/pageActions","../dictionaries","../views/QiResultFilterView","../views/QiResultListView","app/qiResults/templates/addPageActions"],function(e,t,i,s,o,n,r,l){"use strict";return i.extend({baseBreadcrumb:!0,FilterView:n,ListView:r,actions:function(i){var o=this.collection;return[s.jump(this,o),s["export"](i,this,this.collection,!1),{template:l,privileges:function(){return t.isAllowedTo("QI:INSPECTOR","QI:RESULTS:MANAGE")}},{label:e.bound("qiResults","PAGE_ACTION:settings"),icon:"cogs",privileges:"QI:DICTIONARIES:MANAGE",href:"#qi/settings?tab=results"}]},load:function(e){return e(this.collection.fetch({reset:!0}),o.load())},destroy:function(){i.prototype.destroy.call(this),o.unload()},afterRender:function(){i.prototype.afterRender.call(this),o.load()}})});