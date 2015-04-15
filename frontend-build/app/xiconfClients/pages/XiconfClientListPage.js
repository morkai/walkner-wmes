// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/views/DialogView","app/core/pages/FilteredListPage","app/xiconf/XiconfSettingCollection","../views/XiconfClientListView","../views/XiconfClientFilterView","app/xiconfClients/templates/updateAllDialog"],function(e,t,i,n,s,l,o,c,a){"use strict";return s.extend({FilterView:c,ListView:o,breadcrumbs:function(){return[e.bound("xiconfClients","BREADCRUMBS:base"),e.bound("xiconfClients","BREADCRUMBS:browse")]},actions:function(){return[{label:e.bound("xiconfClients","page:update"),icon:"forward",privileges:"XICONF:MANAGE",callback:this.updateAll.bind(this)}]},defineModels:function(){this.collection=i(this.collection,this),this.settings=i(new l(null,{pubsub:this.pubsub}),this)},createListView:function(){return new o({collection:this.collection,settings:this.settings})},load:function(e){return e(this.collection.fetch({reset:!0}),this.settings.fetch({reset:!0}))},updateAll:function(i){var s=this.$(".action-update").filter(function(){return!this.classList.contains("disabled")});if(!s.length)return t.msg.show({type:"warning",time:2e3,text:e("xiconfClients","MSG:NO_APPS_TO_UPDATE")}),!1;i.currentTarget.blur();var l=this,o=new n({template:a});return this.listenTo(o,"answered",function(e){"yes"===e&&(i.currentTarget.classList.add("disabled"),l.timers.updateAll=setTimeout(function(){i.currentTarget.classList.remove("disabled")},1e4),s.click())}),t.showDialog(o,e("xiconfClients","updateAllDialog:title")),!1}})});