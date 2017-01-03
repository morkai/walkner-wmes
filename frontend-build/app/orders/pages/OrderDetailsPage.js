// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/core/util/bindLoadingMessage","app/core/pages/DetailsPage","app/delayReasons/storage","../Order","../OrderCollection","../ComponentCollection","../util/openOrderPrint","../views/OrderDetailsView","../views/OperationListView","../views/DocumentListView","../views/ComponentListView","../views/OrderChangesView","../views/EtoView","app/orders/templates/detailsJumpList"],function(e,t,i,s,n,o,r,d,a,h,l,c,p,m,u,w,f){"use strict";return n.extend({pageId:"orderDetails",actions:function(){return{label:i.bound("orders","PAGE_ACTION:print"),icon:"print",href:"/orders/"+this.model.id+".html?print",callback:function(e){return h(e,this.querySelector("a"))}}},remoteTopics:{"orders.updated.*":"onOrderUpdated","orders.synced":"onSynced","orders.*.synced":"onSynced","orderDocuments.synced":"onSynced"},events:{"click #-jumpList > a":function(e){var i=e.currentTarget.getAttribute("href").substring(1),s=this.$("."+i),n=s.offset().top-14,o=t(".navbar-fixed-top");return o.length&&(n-=o.outerHeight()),t("html, body").stop(!0,!1).animate({scrollTop:n}),!1}},initialize:function(){this.model=s(new r({_id:this.options.modelId}),this),this.delayReasons=s(o.acquire(),this),this.paintOrders=s(new d(null,{rqlQuery:"select(bom)&operations.workCenter=PAINT&leadingOrder="+this.options.modelId}),this),this.paintOrder=new r({bom:new a}),this.detailsView=new l({model:this.model,delayReasons:this.delayReasons}),this.operationsView=new c({model:this.model}),this.documentsView=new p({model:this.model}),this.componentsView=new m({model:this.model}),this.paintComponentsView=new m({model:this.paintOrder,paint:!0}),this.etoView=new w({model:this.model}),this.changesView=new u({model:this.model,delayReasons:this.delayReasons}),this.insertView(this.detailsView),this.insertView(this.operationsView),this.insertView(this.documentsView),this.insertView(this.componentsView),this.insertView(this.paintComponentsView),this.insertView(this.etoView),this.insertView(this.changesView),this.listenTo(this.paintOrders,"reset",this.onPaintOrdersReset)},destroy:function(){o.release()},load:function(e){return e(this.model.fetch(),this.paintOrders.fetch({reset:!0}),this.delayReasons.isEmpty()?this.delayReasons.fetch({reset:!0}):null)},afterRender:function(){o.acquire(),this.renderJumpList()},onOrderUpdated:function(e){this.model.id===e._id&&(this.model.set("delayReason",e.delayReason),this.model.get("changes").push(e.change),this.model.trigger("push:change",e.change))},onSynced:function(){this.promised(this.model.fetch())},renderJumpList:function(){this.$id("jumpList").remove(),this.$el.append(f({idPrefix:this.idPrefix}))},onPaintOrdersReset:function(){var t=new a,i=0;this.paintOrders.forEach(function(s){s.get("bom").forEach(function(s){t.add(e.assign({},s.toJSON(),{index:i++}))})}),this.paintOrder.set("bom",t)}})});