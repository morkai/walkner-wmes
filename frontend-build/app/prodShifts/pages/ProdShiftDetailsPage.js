// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/time","app/user","app/viewport","app/core/util/bindLoadingMessage","app/core/util/getShiftStartInfo","app/core/util/pageActions","app/core/util/onModelDeleted","app/core/View","app/prodChangeRequests/util/createDeletePageAction","app/prodShiftOrders/ProdShiftOrderCollection","app/prodDowntimes/ProdDowntimeCollection","../ProdShift","../views/ProdShiftDetailsView","../views/ProdShiftTimelineView","../views/QuantitiesDoneChartView","app/prodShifts/templates/detailsPage"],function(t,i,e,s,o,r,d,h,n,p,a,f,u,l,c,S,b,m){"use strict";var w={idle:"warning",working:"success",downtime:"danger"};return p.extend({template:m,layoutName:"page",pageId:"details",localTopics:{"socket.connected":function(){this.promised(this.prodShift.fetch()),this.promised(this.prodShiftOrders.fetch({reset:!0})),this.promised(this.prodDowntimes.fetch({reset:!0}))}},breadcrumbs:function(){return[{label:i.bound("prodShifts","BREADCRUMBS:browse"),href:this.prodShift.genClientUrl("base")},this.prodShift.getLabel()]},actions:function(){var t=[];return this.prodShift.id&&t.push({label:i.bound("prodShifts","PAGE_ACTION:prodLogEntries"),icon:"list-ol",href:"#prodLogEntries?sort(createdAt)&limit(20)&prodShift="+encodeURIComponent(this.prodShift.id)}),this.prodShift.hasEnded()&&s.isAllowedTo("PROD_DATA:MANAGE","PROD_DATA:CHANGES:REQUEST")&&t.push(h.edit(this.prodShift,!1),a(this,this.prodShift)),t},initialize:function(){this.layout=null,this.shiftPubsub=this.pubsub.sandbox(),this.defineModels(),this.defineViews(),this.defineBindings(),this.setView(".prodShifts-details-container",this.detailsView),this.setView(".prodShifts-timeline-container",this.timelineView),this.setView(".prodShifts-quantitiesDone-container",this.quantitiesDoneChartView)},setUpLayout:function(t){this.layout=t},destroy:function(){this.layout=null,this.shiftPubsub.destroy(),this.shiftPubsub=null},defineModels:function(){function t(t,i){return Date.parse(t.get("startedAt"))-Date.parse(i.get("startedAt"))}this.prodShift=r(new l({_id:this.options.modelId}),this),this.prodShiftOrders=r(new f(null,{rqlQuery:{fields:{orderData:0,spigot:0},sort:{startedAt:1},limit:9999,selector:{name:"and",args:[{name:"eq",args:["prodShift",this.prodShift.id]}]}},comparator:t}),this),this.prodDowntimes=r(new u(null,{rqlQuery:{fields:{prodShiftOrder:1,startedAt:1,finishedAt:1,status:1,reason:1,aor:1},sort:{startedAt:1},limit:9999,selector:{name:"and",args:[{name:"eq",args:["prodShift",this.prodShift.id]}]}},comparator:t}),this)},defineViews:function(){this.detailsView=new c({model:this.prodShift}),this.timelineView=new S({prodShift:this.prodShift,prodShiftOrders:this.prodShiftOrders,prodDowntimes:this.prodDowntimes}),this.quantitiesDoneChartView=new b({model:this.prodShift})},defineBindings:function(){this.listenToOnce(this.prodShift,"sync",function(){this.setUpRemoteTopics(),this.options.latest||this.setUpShiftRemoteTopics()}),this.listenTo(this.prodShift,"change:_id",function(){this.setUpShiftRemoteTopics(),this.prodShiftOrders.reset([]),this.prodDowntimes.reset([]),this.prodShiftOrders.rqlQuery.selector.args[0].args[1]=this.prodShift.id,this.prodDowntimes.rqlQuery.selector.args[0].args[1]=this.prodShift.id,this.promised(this.prodShiftOrders.fetch({reset:!0})),this.promised(this.prodDowntimes.fetch({reset:!0})),this.options.latest&&this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this))}),this.options.latest&&this.setUpDetailsPanelType()},load:function(t){return this.options.latest?t(this.prodShift.fetch()):t(this.prodShift.fetch(),this.prodShiftOrders.fetch({reset:!0}),this.prodDowntimes.fetch({reset:!0}))},updatePanelType:function(){this.detailsView.setPanelType(w[this.timelineView.getLastState()])},setUpDetailsPanelType:function(){var i=t.debounce(this.updatePanelType.bind(this),1);this.listenTo(this.prodShiftOrders,"reset add remove change",i),this.listenTo(this.prodDowntimes,"reset add remove change",i)},setUpShiftRemoteTopics:function(){this.shiftPubsub.destroy(),this.shiftPubsub=this.pubsub.sandbox(),this.shiftPubsub.subscribe("prodShifts.updated."+this.prodShift.id,this.onProdShiftUpdated.bind(this)),this.shiftPubsub.subscribe("prodShifts.deleted."+this.prodShift.id,this.onProdShiftDeleted.bind(this))},setUpRemoteTopics:function(){this.pubsub.subscribe("prodShiftOrders.created."+this.prodShift.get("prodLine"),this.onProdShiftOrderCreated.bind(this)),this.pubsub.subscribe("prodShiftOrders.updated.*",this.onProdShiftOrderUpdated.bind(this)),this.pubsub.subscribe("prodShiftOrders.deleted.*",this.onProdShiftOrderDeleted.bind(this)),this.pubsub.subscribe("prodDowntimes.created."+this.prodShift.get("prodLine"),this.onProdDowntimeCreated.bind(this)),this.pubsub.subscribe("prodDowntimes.updated.*",this.onProdDowntimeUpdated.bind(this)),this.pubsub.subscribe("prodDowntimes.deleted.*",this.onProdDowntimeDeleted.bind(this)),this.options.latest&&this.pubsub.subscribe("prodShifts.created."+this.prodShift.get("prodLine"),this.onProdShiftCreated.bind(this))},onProdShiftCreated:function(){this.promised(this.prodShift.set("_id",this.prodShift.get("prodLine"),{silent:!0}).fetch())},onProdShiftUpdated:function(t){this.prodShift.set(t)},onProdShiftDeleted:function(){n(this.broker,this.prodShift,null,!0)},onProdShiftOrderCreated:function(t){t.prodShift===this.prodShift.id&&this.prodShiftOrders.add(t)},onProdShiftOrderUpdated:function(t){var i=this.prodShiftOrders.get(t._id);i&&i.set(t)},onProdShiftOrderDeleted:function(t){var i=this.prodShiftOrders.get(t._id);i&&this.prodShiftOrders.remove(i)},onProdDowntimeCreated:function(t){t.prodShift===this.prodShift.id&&this.prodDowntimes.add(t)},onProdDowntimeUpdated:function(t){var i=this.prodDowntimes.get(t._id);i&&i.set(t)},onProdDowntimeDeleted:function(t){var i=this.prodDowntimes.get(t._id);i&&this.prodDowntimes.remove(i)}})});