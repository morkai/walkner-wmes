define(["underscore","app/i18n","app/time","app/user","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/util/onModelDeleted","app/core/View","app/mechOrders/MechOrder","app/mechOrders/views/MechOrderDetailsView","app/orders/Order","app/orders/OperationCollection","app/orders/views/OrderDetailsView","app/orders/views/OperationListView","app/prodDowntimes/ProdDowntimeCollection","app/prodDowntimes/views/ProdDowntimeListView","../ProdShiftOrder","../views/ProdShiftOrderDetailsView","app/prodShiftOrders/templates/detailsPage"],function(e,r,t,i,d,o,s,n,h,p,a,l,f,c,O,u,w,S,m,b){return h.extend({template:b,layoutName:"page",pageId:"details",breadcrumbs:function(){return[{label:r.bound("prodShiftOrders","BREADCRUMBS:browse"),href:this.prodShiftOrder.genClientUrl("base")},r.bound("prodShiftOrders","BREADCRUMBS:details",{prodLine:this.prodShiftOrder.get("prodLine"),order:this.prodShiftOrder.get("orderId"),operation:this.prodShiftOrder.get("operationNo")})]},actions:function(){var e=[{label:r.bound("prodShiftOrders","PAGE_ACTION:prodLogEntries"),icon:"list-ol",href:"#prodLogEntries?sort(createdAt)&limit(20)&prodShiftOrder="+encodeURIComponent(this.prodShiftOrder.id)}];return this.prodShiftOrder.isEditable()&&e.push(s.edit(this.prodShiftOrder,"PROD_DATA:MANAGE"),s.delete(this.prodShiftOrder,"PROD_DATA:MANAGE")),e},initialize:function(){this.defineModels(),this.defineViews(),this.listenToOnce(this.prodShiftOrder,"sync",this.onSync),this.setView(".prodShiftOrders-details-container",this.detailsView),this.insertView(".prodShiftOrders-downtimes-container",this.downtimesView)},defineModels:function(){this.prodShiftOrder=o(new S({_id:this.options.modelId}),this),this.prodDowntimes=o(new u(null,{rqlQuery:{sort:{startedAt:1},limit:9999,selector:{name:"and",args:[{name:"eq",args:["prodShiftOrder",this.prodShiftOrder.id]}]}}}),this)},defineViews:function(){this.detailsView=new m({model:this.prodShiftOrder}),this.downtimesView=new w({collection:this.prodDowntimes})},load:function(e){return e(this.prodShiftOrder.fetch(),this.prodDowntimes.fetch({reset:!0}))},onSync:function(){this.setUpRemoteTopics();var e=this.prepareOrderData();this.order=this.prodShiftOrder.get("mechOrder")?new p(e):new l(e);var t={model:this.order,panelType:"default",panelTitle:r("prodShiftOrders","PANEL:TITLE:orderDetails")};this.orderDetailsView=this.prodShiftOrder.get("mechOrder")?new a(t):new c(t),this.operationListView=new O({model:this.order,highlighted:this.prodShiftOrder.get("operationNo")}),this.setView(".prodShiftOrders-order-container",this.orderDetailsView),this.setView(".prodShiftOrders-operations-container",this.operationListView)},prepareOrderData:function(){var r=e.clone(this.prodShiftOrder.get("orderData"));return r.no&&(r._id=r.no),r.operations=new f(e.values(r.operations||{})),r},setUpRemoteTopics:function(){function e(e){return e.model._id===r}var r=this.prodShiftOrder.get("pressWorksheet");r?(this.pubsub.subscribe("pressWorksheets.edited",this.onWorksheetEdited.bind(this)).setFilter(e),this.pubsub.subscribe("pressWorksheets.deleted",this.onModelDeleted.bind(this)).setFilter(e)):(this.pubsub.subscribe("prodShiftOrders.updated."+this.prodShiftOrder.id,this.onProdShiftOrderUpdated.bind(this)),this.pubsub.subscribe("prodShiftOrders.deleted."+this.prodShiftOrder.id,this.onModelDeleted.bind(this)))},onProdShiftOrderUpdated:function(e){this.prodShiftOrder.set(e)},onWorksheetEdited:function(){this.timers.refreshData=setTimeout(function(e){e.promised(e.prodShiftOrder.fetch()).fail(function(r){404===r.status&&e.onModelDeleted()})},2500,this)},onModelDeleted:function(){n(this.broker,this.prodShiftOrder,null,!0)}})});