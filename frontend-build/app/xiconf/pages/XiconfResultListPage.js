// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../XiconfResultCollection","../views/XiconfResultListView","../views/XiconfResultFilterView","app/core/templates/listPage"],function(e,i,t,n,l,o,s,r,c){return l.extend({template:c,layoutName:"page",pageId:"xiconfResultList",breadcrumbs:[e.bound("xiconf","BREADCRUMBS:base"),e.bound("xiconf","BREADCRUMBS:browse")],actions:function(e){return[n.export(e,this,this.collection)]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},defineModels:function(){this.collection=t(new o(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.listView=new s({collection:this.collection}),this.filterView=new r({model:{rqlQuery:this.collection.rqlQuery},collection:this.collection}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow(),this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});