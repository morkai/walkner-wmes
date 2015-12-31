// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../PurchaseOrderCollection","../views/PurchaseOrderListView","../views/PurchaseOrderFilterView","app/core/templates/listPage"],function(e,i,t,s,r,l,n){"use strict";return t.extend({template:n,layoutName:"page",breadcrumbs:[e.bound("purchaseOrders","BREADCRUMBS:browse")],actions:[],initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},defineModels:function(){this.collection=i(new s(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.filterView=new l({model:{rqlQuery:this.collection.rqlQuery}}),this.listView=new r({collection:this.collection}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow(),this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});