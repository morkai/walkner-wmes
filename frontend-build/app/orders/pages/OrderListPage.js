// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","app/delayReasons/storage","../OrderCollection","../views/OrderListView","../views/OrderFilterView","app/core/templates/listPage"],function(e,i,t,s,r,l,n,o){"use strict";return t.extend({template:o,layoutName:"page",pageId:"orderList",breadcrumbs:[e.bound("orders","BREADCRUMBS:browse")],initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},destroy:function(){s.release()},defineModels:function(){this.collection=i(new r(null,{rqlQuery:this.options.rql}),this),this.delayReasons=i(s.acquire(),this)},defineViews:function(){this.filterView=new n({model:{rqlQuery:this.collection.rqlQuery}}),this.listView=new l({collection:this.collection,delayReasons:this.delayReasons}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}),this.delayReasons.isEmpty()?this.delayReasons.fetch({reset:!0}):null)},afterRender:function(){s.acquire()},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow(),this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});