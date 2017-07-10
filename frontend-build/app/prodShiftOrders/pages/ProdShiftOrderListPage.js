// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","app/users/ownMrps","../ProdShiftOrderCollection","../views/ProdShiftOrderListView","../views/ProdShiftOrderFilterView","app/core/templates/listPage"],function(e,i,t,r,s,o,l,n,c,h){"use strict";return s.extend({template:h,layoutName:"page",pageId:"prodShiftOrderList",breadcrumbs:[e.bound("prodShiftOrders","BREADCRUMBS:browse")],actions:function(e){return[r.export(e,this,this.collection)]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},defineModels:function(){this.collection=t(new l(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.listView=new n({collection:this.collection}),this.filterView=new c({model:{rqlQuery:this.collection.rqlQuery}}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}),o.load(this))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow(),this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});