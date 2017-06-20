// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../settings","../ProdDowntimeCollection","../views/ProdDowntimeListView","../views/ProdDowntimeFilterView","app/core/templates/listPage"],function(e,i,t,s,o,n,r,l,c,h){"use strict";return o.extend({template:h,layoutName:"page",pageId:"prodDowntimeList",breadcrumbs:[e.bound("prodDowntimes","BREADCRUMBS:browse")],actions:function(i){return[s.jump(this,this.collection),s.export(i,this,this.collection),{label:e.bound("prodDowntimes","PAGE_ACTION:settings"),icon:"cogs",privileges:"PROD_DATA:MANAGE",href:"#prodDowntimes;settings"},{label:e.bound("prodDowntimes","PAGE_ACTION:alerts"),icon:"bell",privileges:"PROD_DOWNTIME_ALERTS:VIEW",href:"#prodDowntimeAlerts"}]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},destroy:function(){n.release()},defineModels:function(){this.collection=t(this.collection,this),this.settings=t(n.acquire(),this)},defineViews:function(){this.listView=new l({collection:this.collection,settings:this.settings}),this.filterView=new c({model:{rqlQuery:this.collection.rqlQuery}}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return this.settings.isEmpty()?e(this.collection.fetch({reset:!0}),this.settings.fetch({reset:!0})):e(this.collection.fetch({reset:!0}))},afterRender:function(){n.acquire()},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow(),this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});