// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../FteLeaderEntryCollection","../views/FteLeaderEntryListView","../views/FteEntryFilterView","app/core/templates/listPage"],function(e,i,t,n,r,l,s,o){return n.extend({template:o,layoutName:"page",pageId:"fteLeaderEntryList",breadcrumbs:[e.bound("fte","BREADCRUMBS:leader:browse")],actions:function(i){return[{label:e.bound("fte","PAGE_ACTION:add"),href:"#fte/leader;add",icon:"plus",privileges:"FTE:LEADER:MANAGE|PROD_DATA:MANAGE"},t.export(i,this,this.collection)]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},defineModels:function(){this.collection=i(new r(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.filterView=new s({model:{rqlQuery:this.collection.rqlQuery},divisionFilter:function(e){return"dist"===e.get("type")}}),this.listView=new l({collection:this.collection}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow();var i=e.toString();this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+i,trigger:!1,replace:!0})}})});