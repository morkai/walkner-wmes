define(["app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/views/DialogView","app/core/pages/FilteredListPage","app/xiconf/settings","../views/XiconfClientListView","../views/XiconfClientFilterView","app/xiconfClients/templates/updateAllDialog"],function(t,e,i,n,s,l,o,r,c){"use strict";return s.extend({FilterView:r,ListView:o,breadcrumbs:function(){return[t.bound("xiconfClients","BREADCRUMB:base"),t.bound("xiconfClients","BREADCRUMB:browse")]},actions:function(){return[{label:t.bound("xiconfClients","page:update"),icon:"forward",privileges:"XICONF:MANAGE",callback:this.updateAll.bind(this)},{label:t.bound("xiconfClients","page:settings"),icon:"cogs",privileges:"XICONF:MANAGE",href:"#xiconf;settings?tab=clients"}]},destroy:function(){s.prototype.destroy.call(this),l.release()},defineModels:function(){this.collection=i(this.collection,this),this.settings=i(l.acquire(),this)},createListView:function(){return new o({collection:this.collection,settings:this.settings})},load:function(t){return this.settings.isEmpty()?t(this.collection.fetch({reset:!0}),this.settings.fetch({reset:!0})):t(this.collection.fetch({reset:!0}))},afterRender:function(){s.prototype.afterRender.call(this),l.acquire()},updateAll:function(i){var s=this,l=s.$(".action-update").filter(function(){return!this.classList.contains("disabled")&&!/^rpi/.test(s.$(this).closest("tr").attr("data-id"))});if(!l.length)return e.msg.show({type:"warning",time:2e3,text:t("xiconfClients","MSG:NO_APPS_TO_UPDATE")}),!1;i.currentTarget.blur();var o=new n({template:c});return s.listenTo(o,"answered",function(t){"yes"===t&&(i.currentTarget.classList.add("disabled"),s.timers.updateAll=setTimeout(function(){i.currentTarget.classList.remove("disabled")},1e4),l.click())}),e.showDialog(o,t("xiconfClients","updateAllDialog:title")),!1}})});