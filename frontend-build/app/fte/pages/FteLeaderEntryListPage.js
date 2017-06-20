// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/user","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../FteLeaderEntryCollection","../views/FteLeaderEntryListView","../views/FteEntryFilterView","app/core/templates/listPage"],function(e,t,i,n,r,s,l,o,c){"use strict";return r.extend({template:c,layoutName:"page",pageId:"fteLeaderEntryList",breadcrumbs:[e.bound("fte","BREADCRUMBS:leader:browse")],actions:function(i){return[{label:e.bound("fte","PAGE_ACTION:add"),href:"#fte/leader;add",icon:"plus",privileges:function(){return t.isAllowedTo("FTE:LEADER:MANAGE","PROD_DATA:MANAGE")}},n.export(i,this,this.collection),{label:e.bound("fte","PAGE_ACTION:settings"),icon:"cogs",privileges:"PROD_DATA:MANAGE",href:"#fte;settings?tab=structure"}]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},defineModels:function(){this.collection=i(new s(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.filterView=new o({model:{rqlQuery:this.collection.rqlQuery},divisionFilter:function(e){return"prod"!==e.get("type")}}),this.listView=new l({collection:this.collection}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow();var t=e.toString();this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+t,trigger:!1,replace:!0})}})});