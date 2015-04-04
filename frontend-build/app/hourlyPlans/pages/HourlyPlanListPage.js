// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../HourlyPlanCollection","../views/HourlyPlanListView","app/fte/views/FteEntryFilterView","app/core/templates/listPage"],function(e,i,t,l,n,o,r,s,c){"use strict";return n.extend({template:c,layoutName:"page",pageId:"hourlyPlanList",breadcrumbs:[e.bound("hourlyPlans","BREADCRUMBS:browse")],actions:function(t){return[{label:e.bound("hourlyPlans","PAGE_ACTION:add"),href:"#hourlyPlans;add",icon:"plus",privileges:function(){return i.isAllowedTo("HOURLY_PLANS:MANAGE","PROD_DATA:MANAGE")}},l["export"](t,this,this.collection)]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},defineModels:function(){this.collection=t(new o(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.filterView=new s({model:{rqlQuery:this.collection.rqlQuery},divisionOnly:!0,divisionFilter:function(e){return"prod"===e.get("type")}}),this.listView=new r({collection:this.collection}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow();var i=e.toString();this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+i,trigger:!1,replace:!0})}})});