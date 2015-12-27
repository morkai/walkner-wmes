// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/pages/DetailsPage","app/delayReasons/storage","../Order","../util/openOrderPrint","../views/OrderDetailsView","../views/OperationListView","../views/DocumentListView","../views/ComponentListView","../views/OrderChangesView","app/orders/templates/detailsPage"],function(e,s,i,t,n,o,d,r,a,h,l,c){"use strict";return i.extend({template:c,pageId:"orderDetails",actions:function(){return{label:e.bound("orders","PAGE_ACTION:print"),icon:"print",href:"/orders/"+this.model.id+".html?print",callback:function(e){return o(e,this.querySelector("a"))}}},remoteTopics:{"orders.updated.*":"onOrderUpdated","orders.synced":"onSynced","orders.*.synced":"onSynced","orderDocuments.synced":"onSynced"},initialize:function(){this.model=s(new n({_id:this.options.modelId}),this),this.delayReasons=s(t.acquire(),this),this.detailsView=new d({model:this.model,delayReasons:this.delayReasons}),this.operationsView=new r({model:this.model}),this.documentsView=new a({model:this.model}),this.componentsView=new h({model:this.model}),this.changesView=new l({model:this.model,delayReasons:this.delayReasons}),this.setView(".orders-details-container",this.detailsView),this.setView(".orders-operations-container",this.operationsView),this.setView(".orders-documents-container",this.documentsView),this.setView(".orders-components-container",this.componentsView),this.setView(".orders-changes-container",this.changesView)},destroy:function(){t.release()},load:function(e){return e(this.model.fetch(),this.delayReasons.isEmpty()?this.delayReasons.fetch({reset:!0}):null)},afterRender:function(){t.acquire()},onOrderUpdated:function(e){this.model.id===e._id&&(this.model.set("delayReason",e.delayReason),this.model.get("changes").push(e.change),this.model.trigger("push:change",e.change))},onSynced:function(){this.promised(this.model.fetch())}})});