// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/viewport","app/i18n","app/core/util/bindLoadingMessage","app/core/View","../EventCollection","../EventTypeCollection","../views/EventListView","../views/EventFilterView","app/events/templates/listPage"],function(e,t,i,s,n,r,l,h,o,a){return n.extend({template:a,layoutName:"page",pageId:"eventList",breadcrumbs:[i.bound("events","BREADCRUMBS:browse")],initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".events-list-container",this.listView)},defineModels:function(){this.eventList=s(new r(null,{rqlQuery:this.options.rql}),this),this.eventTypes=s(new l,this,"MSG:LOADING_TYPES_FAILURE")},defineViews:function(){this.listView=new h({collection:this.eventList}),this.filterView=new o({model:{rqlQuery:this.eventList.rqlQuery,eventTypes:this.eventTypes}}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.eventList.fetch({reset:!0}),this.eventTypes.fetch({reset:!0}))},refreshList:function(e){this.eventList.rqlQuery=e,this.listView.refreshCollection(null,!0),this.broker.publish("router.navigate",{url:this.eventList.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});