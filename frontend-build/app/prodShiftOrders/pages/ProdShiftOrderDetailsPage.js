// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/time","app/user","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/util/onModelDeleted","app/core/View","app/prodChangeRequests/util/createDeletePageAction","app/delayReasons/storage","app/mechOrders/MechOrder","app/mechOrders/views/MechOrderDetailsView","app/orders/Order","app/orders/OperationCollection","app/orders/views/OrderDetailsView","app/orders/views/OperationListView","app/prodDowntimes/ProdDowntimeCollection","app/prodDowntimes/views/ProdDowntimeListView","../ProdShiftOrder","../views/ProdShiftOrderDetailsView","app/prodShiftOrders/templates/detailsPage"],function(e,t,i,r,s,d,o,n,h,p,a,l,f,c,u,O,w,S,m,b,D,g){"use strict";return h.extend({template:g,layoutName:"page",pageId:"details",breadcrumbs:function(){return[{label:t.bound("prodShiftOrders","BREADCRUMBS:browse"),href:this.prodShiftOrder.genClientUrl("base")},this.prodShiftOrder.getLabel()]},actions:function(){var e=[{label:t.bound("prodShiftOrders","PAGE_ACTION:prodLogEntries"),icon:"list-ol",href:"#prodLogEntries?sort(createdAt)&limit(20)&prodShiftOrder="+encodeURIComponent(this.prodShiftOrder.id)}];return this.prodShiftOrder.isEditable()&&r.isAllowedTo("PROD_DATA:MANAGE","PROD_DATA:CHANGES:REQUEST")&&e.push(o.edit(this.prodShiftOrder,!1),p(this,this.prodShiftOrder)),e},initialize:function(){this.defineModels(),this.defineViews(),this.listenToOnce(this.prodShiftOrder,"sync",this.onSync),this.setView(".prodShiftOrders-details-container",this.detailsView),this.insertView(".prodShiftOrders-downtimes-container",this.downtimesView)},destroy:function(){a.release()},defineModels:function(){this.delayReasons=d(a.acquire(),this),this.prodShiftOrder=d(new b({_id:this.options.modelId}),this),this.prodDowntimes=d(new S(null,{rqlQuery:{sort:{startedAt:1},limit:9999,selector:{name:"and",args:[{name:"eq",args:["prodShiftOrder",this.prodShiftOrder.id]}]}}}),this)},defineViews:function(){this.detailsView=new D({model:this.prodShiftOrder}),this.downtimesView=new m({collection:this.prodDowntimes,simple:!0})},load:function(e){return e(this.prodShiftOrder.fetch(),this.prodDowntimes.fetch({reset:!0}),this.delayReasons.isEmpty()?this.delayReasons.fetch({reset:!0}):null)},afterRender:function(){a.acquire()},onSync:function(){this.setUpRemoteTopics();var e=this.prepareOrderData();this.order=this.prodShiftOrder.get("mechOrder")?new l(e):new c(e);var i={model:this.order,panelType:"default",panelTitle:t("prodShiftOrders","PANEL:TITLE:orderDetails"),delayReasons:this.delayReasons};this.orderDetailsView=this.prodShiftOrder.get("mechOrder")?new f(i):new O(i),this.operationListView=new w({model:this.order,highlighted:this.prodShiftOrder.get("operationNo")}),this.setView(".prodShiftOrders-order-container",this.orderDetailsView),this.setView(".prodShiftOrders-operations-container",this.operationListView)},prepareOrderData:function(){var t=e.clone(this.prodShiftOrder.get("orderData"));return t.no&&(t._id=t.no),t.operations=new u(e.values(t.operations||{})),t},setUpRemoteTopics:function(){function e(e){return e.model._id===t}var t=this.prodShiftOrder.get("pressWorksheet");t?(this.pubsub.subscribe("pressWorksheets.edited",this.onWorksheetEdited.bind(this)).setFilter(e),this.pubsub.subscribe("pressWorksheets.deleted",this.onModelDeleted.bind(this)).setFilter(e)):(this.pubsub.subscribe("prodShiftOrders.updated."+this.prodShiftOrder.id,this.onProdShiftOrderUpdated.bind(this)),this.pubsub.subscribe("prodShiftOrders.deleted."+this.prodShiftOrder.id,this.onModelDeleted.bind(this)))},onProdShiftOrderUpdated:function(e){this.prodShiftOrder.set(e)},onWorksheetEdited:function(){this.timers.refreshData=setTimeout(function(e){e.promised(e.prodShiftOrder.fetch()).fail(function(t){404===t.status&&e.onModelDeleted()})},2500,this)},onModelDeleted:function(){n(this.broker,this.prodShiftOrder,null,!0)}})});