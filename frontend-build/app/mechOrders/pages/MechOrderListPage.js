// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/View","../MechOrderCollection","../views/MechOrderListView","../views/MechOrderFilterView","../views/MechOrderImportView","app/core/templates/listPage"],function(e,i,t,r,s,l,n,o,c){"use strict";return r.extend({template:c,layoutName:"page",pageId:"mechOrderList",breadcrumbs:[e.bound("mechOrders","BREADCRUMBS:browse")],actions:[{label:e.bound("mechOrders","PAGE_ACTION:import"),icon:"refresh",privileges:"ORDERS:MANAGE",callback:function(){return i.showDialog(new o,e("mechOrders","import:title")),!1}}],initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},defineModels:function(){this.collection=t(new s(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.filterView=new n({model:{rqlQuery:this.collection.rqlQuery}}),this.listView=new l({collection:this.collection}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow(),this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});