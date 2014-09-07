// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/i18n","app/core/View","app/core/util/bindLoadingMessage","../views/FactoryLayoutCanvasView"],function(e,o,t,i,n){return t.extend({layoutName:"page",localTopics:{"socket.connected":function(){this.model.load(!0)}},breadcrumbs:function(){return[o.bound("factoryLayout","bc:layout")]},actions:function(){return[{label:o.bound("factoryLayout","pa:settings"),icon:"cogs",privileges:"FACTORY_LAYOUT:MANAGE",href:"#factoryLayout;settings?tab=blacklist"}]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(this.canvasView)},destroy:function(){document.body.classList.remove("no-overflow"),this.model.unload(),this.model=null},defineModels:function(){this.model=i(this.model,this)},defineViews:function(){this.canvasView=new n({model:this.model})},load:function(e){return e(this.model.load(!1))},afterRender:function(){document.body.classList.add("no-overflow"),this.model.load(!1)}})});