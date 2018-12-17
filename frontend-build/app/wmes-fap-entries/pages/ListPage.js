define(["app/i18n","app/core/pages/FilteredListPage","app/core/util/pageActions","../dictionaries","../views/FilterView","../views/ListView"],function(t,e,i,o,n,s){"use strict";return e.extend({FilterView:n,ListView:s,actions:function(t){var e=this.collection;return[i.jump(this,e),i.export(t,this,this.collection,!1),{label:this.t("PAGE_ACTION:settings"),icon:"cogs",privileges:"FAP:MANAGE",href:"#fap/settings"}]},load:function(t){return t(this.collection.fetch({reset:!0}),o.load())},destroy:function(){e.prototype.destroy.call(this),o.unload()},afterRender:function(){e.prototype.afterRender.call(this),o.load()}})});