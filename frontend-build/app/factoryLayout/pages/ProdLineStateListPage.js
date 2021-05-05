define(["underscore","jquery","app/i18n","app/core/View","app/core/util/bindLoadingMessage","app/core/templates/listPage","../views/ProdLineStateDisplayOptionsView","../views/ProdLineStateListView"],function(t,i,s,e,o,a,n,l){"use strict";return e.extend({pageId:"prodLineStateList",template:a,layoutName:"page",localTopics:{"socket.connected":function(){this.model.load(!0)}},remoteTopics:{"production.edited.shift.*":function(t){t.comments&&[this.model.prodLineStates.get(t.prodLine),this.model.historyData.get(t._id)].forEach(function(i){if(i){var s=i.get("prodShift");s&&s.id===t._id&&i.update({prodShift:{comments:t.comments}})}})}},breadcrumbs:function(){return[{label:this.t("bc:layout"),href:"#factoryLayout"},this.t("bc:list")]},actions:function(){return[{label:this.t("pa:settings"),icon:"cogs",privileges:"FACTORY_LAYOUT:MANAGE",href:"#factoryLayout;settings?tab=blacklist"}]},initialize:function(){this.historyDataReq=null,this.defineModels(),this.defineViews(),this.defineBindings(),this.setView(".filter-container",this.displayOptionsView),this.setView(".list-container",this.listView)},destroy:function(){this.historyDataReq=null,this.model.unload(),this.model=null},defineModels:function(){this.model=o(this.model,this)},defineViews:function(){this.listView=new l({model:this.model,displayOptions:this.displayOptions}),this.displayOptionsView=new n({model:this.displayOptions})},defineBindings:function(){this.listenTo(this.displayOptions,"change",this.onDisplayOptionsChange)},load:function(t){return this.displayOptions.isHistoryData()?(this.model.historyData.url="/production/history?"+this.displayOptions.serializeToString(),t(this.model.load(!1),this.model.historyData.fetch({reset:!0}))):t(this.model.load(!1))},afterRender:function(){this.model.load(!1)},onDisplayOptionsChange:function(){this.broker.publish("router.navigate",{url:"/factoryLayout;list?"+this.displayOptions.serializeToString(),trigger:!1,replace:!0}),this.displayOptions.haveHistoryOptionsChanged()&&this.toggleHistoryData()},toggleHistoryData:function(){if(this.model.historyData.reset([]),this.displayOptionsView.toggleHistoryData(),this.listView.render(),null!==this.historyDataReq&&(this.historyDataReq.abort(),this.historyDataReq=null),this.displayOptions.isHistoryData()){this.model.historyData.url="/production/history?"+this.displayOptions.serializeToString();var t=this;this.historyDataReq=this.promised(this.model.historyData.fetch({reset:!0})),this.historyDataReq.always(function(){t.historyDataReq=null})}}})});