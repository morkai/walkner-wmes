define(["app/i18n","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../OrderCollection","../views/OrderListView","../views/OrderFilterView","app/orders/templates/listPage","i18n!app/nls/orders"],function(e,i,t,r,s,l,n,o){return r.extend({template:o,layoutName:"page",pageId:"orderList",breadcrumbs:[e.bound("orders","BREADCRUMBS:browse")],initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".orders-list-container",this.listView)},defineModels:function(){this.collection=i(new s(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.filterView=new n({model:{rqlQuery:this.collection.rqlQuery}}),this.listView=new l({collection:this.collection}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollection(null,!0),this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});