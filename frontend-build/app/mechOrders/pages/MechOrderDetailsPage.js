define(["app/core/util/bindLoadingMessage","app/core/pages/DetailsPage","../MechOrder","app/orders/views/OperationListView","app/mechOrders/views/MechOrderDetailsView","app/mechOrders/templates/detailsPage"],function(e,i,t,s,a,r){return i.extend({template:r,pageId:"mechOrderDetails",actions:[],initialize:function(){this.model=e(new t({_id:this.options.modelId}),this),this.detailsView=new a({model:this.model}),this.operationsView=new s({model:this.model}),this.setView(".mechOrders-details-container",this.detailsView),this.setView(".mechOrders-operations-container",this.operationsView)},load:function(e){return e(this.model.fetch())}})});