// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/i18n","app/core/View","app/core/util/bindLoadingMessage","app/core/templates/listPage","../views/ProdLineStateDisplayOptionsView","../views/ProdLineStateListView"],function(i,t,e,s,n,o,a,l){return s.extend({pageId:"prodLineStateList",template:o,layoutName:"page",localTopics:{"socket.connected":function(){this.model.load(!0)}},breadcrumbs:[{label:e.bound("factoryLayout","bc:layout"),href:"#factoryLayout"},e.bound("factoryLayout","bc:list")],actions:function(){return[{label:e.bound("factoryLayout","pa:settings"),icon:"cogs",privileges:"FACTORY_LAYOUT:MANAGE",href:"#factoryLayout;settings?tab=blacklist"}]},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings(),this.setView(".filter-container",this.displayOptionsView),this.setView(".list-container",this.listView)},destroy:function(){this.model.unload(),this.model=null},defineModels:function(){this.model=n(this.model,this)},defineViews:function(){this.listView=new l({model:this.model,displayOptions:this.displayOptions}),this.displayOptionsView=new a({model:this.displayOptions})},defineBindings:function(){this.listenTo(this.displayOptions,"change",this.onDisplayOptionsChange)},load:function(i){return i(this.model.load(!1))},afterRender:function(){this.model.load(!1)},onDisplayOptionsChange:function(){this.broker.publish("router.navigate",{url:"/factoryLayout;list?"+this.displayOptions.serializeToString()})}})});