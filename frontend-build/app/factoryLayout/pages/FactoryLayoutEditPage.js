// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/core/View","app/core/util/bindLoadingMessage","../views/FactoryLayoutView"],function(e,t,o,n,i){"use strict";return o.extend({layoutName:"page",localTopics:{"socket.connected":function(){this.promised(this.model.fetch({reset:!0}))}},breadcrumbs:function(){return[{label:t.bound("factoryLayout","bc:layout"),href:this.model.genClientUrl()},t.bound("factoryLayout","bc:layout:edit")]},actions:function(){return[{label:t.bound("factoryLayout","pa:layout:live"),icon:"save",callback:function(){}}]},initialize:function(){this.defineModels(),this.defineViews()},destroy:function(){document.body.classList.remove("no-overflow"),this.model=null},defineModels:function(){this.model=n(this.model,this)},defineViews:function(){this.view=new i({})},load:function(e){return e(this.model.fetch({reset:!0}))},afterRender:function(){document.body.classList.add("no-overflow")}})});