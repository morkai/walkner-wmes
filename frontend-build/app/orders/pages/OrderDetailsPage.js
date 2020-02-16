define(["underscore","jquery","app/i18n","app/user","app/core/util/bindLoadingMessage","app/core/util/embedded","app/core/pages/DetailsPage","app/data/loadedModules","app/data/localStorage","app/delayReasons/storage","app/printers/views/PrinterPickerView","app/wmes-fap-entries/dictionaries","app/wmes-fap-entries/EntryCollection","app/prodDowntimes/ProdDowntimeCollection","../Order","../OrderCollection","../ComponentCollection","../util/openOrderPrint","../views/OrderDetailsView","../views/OrderListView","../views/OperationListView","../views/DocumentListView","../views/ComponentListView","../views/OrderChangesView","../views/EtoView","../views/FapEntryListView","../views/DowntimeListView","../views/NoteListView","app/orders/templates/detailsJumpList","i18n!app/nls/wmes-fap-entries"],function(e,t,i,s,n,o,a,d,r,l,h,c,p,m,u,f,w,g,v,y,O,E,_,D,b,P,T,L,R){"use strict";return a.extend({pageId:"orderDetails",actions:function(){var e=[],t=this.model.id;return d.isLoaded("wmes-ct")&&e.push({label:this.t("PAGE_ACTION:cycleTime"),icon:"clock-o",href:"#ct/reports/pce?orders="+t,privileges:"PROD_DATA:VIEW"}),e.push(h.pageAction({view:this,tag:"orders"},function(e){g([t],e)})),e},remoteTopics:function(){var e={"orders.updated.*":"onOrderUpdated","orders.synced":"onSynced","orders.*.synced":"onSynced","orderDocuments.synced":"onSynced"};return e["orders.quantityDone."+this.model.id]="onQuantityDoneChanged",e},events:{"click #-jumpList > a":function(e){var i=e.currentTarget.dataset.section,s=this.$(".orders-"+i).offset().top-14,n=t(".navbar-fixed-top");return n.length&&(s-=n.outerHeight()),t("html, body").stop(!0,!1).animate({scrollTop:s}),!1},'click .btn[data-action="togglePanel"]':function(e){var t=this.$(e.currentTarget),i=t.closest(".panel"),s=i[0].dataset.id,n=JSON.parse(r.getItem("WMES_ORDERS_PANEL_TOGGLES")||"{}"),o=!i.hasClass("is-expanded");n[s]=o,r.setItem("WMES_ORDERS_PANEL_TOGGLES",JSON.stringify(n)),i.toggleClass("is-expanded",o),t.toggleClass("active",o)}},initialize:function(){var t=this;t.defineModels(),t.defineViews(),t.defineBindings(),e.forEach(t.views_,function(e){t.insertView(e)})},destroy:function(){l.release(),c.unload(),t(window).off("."+this.idPrefix)},defineModels:function(){this.model=n(new u({_id:this.options.modelId}),this),d.isLoaded("prodDowntimes")&&s.isAllowedTo("PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW")&&(this.downtimes=n(new m(null,{rqlQuery:"exclude(changes)&sort(prodLine,startedAt)&orderId=string:"+this.model.id}),this)),this.delayReasons=n(l.acquire(),this),d.isLoaded("wmes-fap")&&s.isAllowedTo("USER")&&(this.fapEntries=n(new p(null,{rqlQuery:"exclude(changes)&sort(_id)&orderNo=string:"+this.model.id}),this)),this.childOrders=n(new f(null,{paginate:!1,rqlQuery:"exclude(operations,bom,documents,changes)&sort(mrp,scheduledStartDate)&limit(0)&_id!="+this.model.id+"&leadingOrder="+this.model.id}),this),d.isLoaded("paintShop")&&(this.paintOrders=n(new f(null,{rqlQuery:"select(mrp,bom)&limit(0)&operations.workCenter=PAINT&leadingOrder="+this.model.id}),this),this.paintOrder=new u({bom:new w}))},defineViews:function(){this.views_={},this.views_.details=new v({model:this.model,delayReasons:this.delayReasons}),this.views_.downtimes=this.downtimes?new T({model:this.model,collection:this.downtimes}):null,this.views_.fapEntries=this.fapEntries?new P({model:this.model,collection:this.fapEntries}):null,this.views_.childOrders=new y({tableClassName:"table-bordered table-hover table-condensed table-striped",model:this.model,collection:this.childOrders,delayReasons:this.delayReasons,panel:{title:this.t("PANEL:TITLE:childOrders"),className:"orders-childOrders",hideEmpty:!0}}),this.views_.operations=new O({model:this.model,showQtyMax:!0}),this.views_.documents=new E({model:this.model}),this.views_.notes=new L({model:this.model}),this.views_.components=new _({model:this.model,linkDocuments:!0,linkPfep:!0}),this.views_.paintComponents=this.paintOrder?new _({model:this.paintOrder,paint:!0,linkPfep:!0}):null,this.views_.eto=new b({model:this.model}),this.views_.changes=new D({model:this.model,delayReasons:this.delayReasons})},defineBindings:function(){this.listenTo(this.paintOrders,"reset",this.onPaintOrdersReset),this.listenTo(this.views_.documents,"documentOpened",this.onDocumentOpened),this.listenTo(this.views_.documents,"documentClosed",this.onDocumentClosed),this.listenTo(this.views_.components,"bestDocumentRequested",this.onBestDocumentRequested),this.listenTo(this.model,"panelToggle",this.renderJumpList),t(window).on("keypress."+this.idPrefix,this.onKeyPress.bind(this))},load:function(e){return e(this.model.fetch(),this.fapEntries?c.load():null,this.fapEntries?this.fapEntries.fetch({reset:!0}):null,this.downtimes?this.downtimes.fetch({reset:!0}):null,this.childOrders.fetch({reset:!0}),this.paintOrders?this.paintOrders.fetch({reset:!0}):null,this.delayReasons.isEmpty()?this.delayReasons.fetch({reset:!0}):null)},afterRender:function(){l.acquire(),this.fapEntries&&c.load(),this.renderJumpList(),this.renderPanelToggles()},onOrderUpdated:function(t){var i=this.model;if(i.id===t._id&&t.change){var s={},n=i.get("changes");Array.isArray(n)||(s.changes=n=[]),e.forEach(t.change.newValues,function(t,n){if("qtyMax"===n){var o={};o[t.operationNo]=t.value,t=e.defaults(o,i.get("qtyMax"))}s[n]=t}),n.push(t.change),i.set(s),i.trigger("push:change",t.change),this.renderPanelToggles()}},onQuantityDoneChanged:function(e){this.model.set("qtyDone",e)},onSynced:function(){this.promised(this.model.fetch())},renderJumpList:function(){var e=this;e.$id("jumpList").remove();var t=o.isEnabled(),i=e.renderPartial(R,{sections:["details","fap","downtimes","childOrders","operations","documents","notes","bom","eto","changes"].map(function(i){var s=e.t("jumpList:"+i).split("_");return{id:i,label:s[0],hotkey:s[1]&&!t?s[1]:""}}).filter(function(t){var i=e.$(".orders-"+t.id).first();return!!i.length&&!i.hasClass("hidden")})});e.$el.append(i)},renderPanelToggles:function(){if(!o.isEnabled()){var e=this,i=JSON.parse(r.getItem("WMES_ORDERS_PANEL_TOGGLES")||"{}");e.getViews().forEach(function(s){if(s!==e.views_.changes){var n=s.$(".table-responsive");if(n.length){var o=n.closest(".panel"),a=o.attr("class").match(/orders-([a-zA-Z]+)/)[1],d=o.find(".panel-heading"),r=n.find("tbody");if(o.attr("data-id",a),!o.hasClass("is-with-actions")){var l=d.text();d.html('<div class="panel-heading-title"></div><div class="panel-heading-actions"></div>'),d.find(".panel-heading-title").text(l),o.addClass("is-with-actions")}var h=d.find(".panel-heading-actions"),c=h.find('.btn[data-action="togglePanel"]'),p=!0===i[a];o.toggleClass("is-expanded",p),r[0].childElementCount>10?(c.length||(c=t('<button class="btn btn-default" type="button" data-action="togglePanel"><i class="fa fa-expand"></i></button>')).appendTo(h),c.toggleClass("active",p)):c.remove()}}})}},onPaintOrdersReset:function(){var t=new w,i=0;this.paintOrders.forEach(function(s){s.get("bom").forEach(function(n){t.add(e.assign({orderNo:s.id,mrp:s.get("mrp"),index:i++},n.toJSON()))})}),this.paintOrder.set("bom",t)},onDocumentOpened:function(e,t){this.views_.components.markDocument(e,t)},onDocumentClosed:function(e,t){this.views_.components.unmarkDocument(e,t)},onBestDocumentRequested:function(e,t){this.views_.documents.openBestDocument(e,t)},onKeyPress:function(e){if("INPUT"!==e.target.tagName&&"TEXTAREA"!==e.target.tagName){var t=e.key.toUpperCase();this.$id("jumpList").find('a[data-hotkey="'+t+'"]').click()}}})});