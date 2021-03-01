define(["underscore","jquery","app/i18n","app/user","app/viewport","app/core/util/bindLoadingMessage","app/core/util/embedded","app/core/pages/DetailsPage","app/data/loadedModules","app/data/localStorage","app/data/delayReasons","app/printers/views/PrinterPickerView","app/wmes-fap-entries/dictionaries","app/wmes-fap-entries/EntryCollection","app/prodDowntimes/ProdDowntimeCollection","../Order","../OrderCollection","../DocumentCollection","../ComponentCollection","../util/openOrderPrint","../views/OrderDetailsView","../views/OrderListView","../views/OperationListView","../views/DocumentListView","../views/ComponentListView","../views/OrderChangesView","../views/EtoView","../views/FapEntryListView","../views/DowntimeListView","../views/NoteListView","app/orders/templates/detailsJumpList","i18n!app/nls/wmes-fap-entries"],function(e,t,i,s,n,o,d,a,r,l,c,h,p,m,u,w,f,g,v,y,O,E,D,_,P,b,L,T,C,R,S){"use strict";return a.extend({pageId:"orderDetails",actions:function(){var e=[],t=this.model.id;return r.isLoaded("wmes-ct")&&e.push({label:this.t("PAGE_ACTION:cycleTime"),icon:"clock-o",href:"#ct/reports/pce?orders="+t,privileges:"PROD_DATA:VIEW"}),e.push(h.pageAction({view:this,tag:"orders"},function(e){y([t],e)})),e},remoteTopics:function(){var e={"orders.updated.*":"onOrderUpdated","orders.synced":"onSynced","orders.*.synced":"onSynced","orderDocuments.synced":"onSynced"};return e["orders.quantityDone."+this.model.id]="onQuantityDoneChanged",e},events:{"click #-jumpList > a":function(e){var i=e.currentTarget.dataset.section,s=this.$(".orders-"+i).offset().top-14,n=t(".navbar-fixed-top");return n.length&&(s-=n.outerHeight()),t("html, body").stop(!0,!1).animate({scrollTop:s}),!1},'click .btn[data-action="togglePanel"]':function(e){var t=this.$(e.currentTarget),i=t.closest(".panel"),s=i[0].dataset.id,n=JSON.parse(l.getItem("WMES_ORDERS_PANEL_TOGGLES")||"{}"),o=!i.hasClass("is-expanded");n[s]=o,l.setItem("WMES_ORDERS_PANEL_TOGGLES",JSON.stringify(n)),i.toggleClass("is-expanded",o),t.toggleClass("active",o)}},initialize:function(){var t=this;t.defineModels(),t.defineViews(),t.defineBindings(),e.forEach(t.views_,function(e){t.insertView(e)})},destroy:function(){p.unload(),t(window).off("."+this.idPrefix),this.cancelPinchZoom&&window.removeEventListener("touchstart",this.cancelPinchZoom)},defineModels:function(){this.model=o(new w({_id:this.options.modelId}),this),r.isLoaded("prodDowntimes")&&s.isAllowedTo("PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW")&&(this.downtimes=o(new u(null,{rqlQuery:"exclude(changes)&sort(prodLine,startedAt)&orderId=string:"+this.model.id}),this)),this.delayReasons=c,r.isLoaded("wmes-fap")&&s.isAllowedTo("USER")&&(this.fapEntries=o(new m(null,{rqlQuery:"exclude(changes)&sort(_id)&orderNo=string:"+this.model.id}),this)),this.childOrders=o(new f(null,{paginate:!1,rqlQuery:"exclude(operations,bom,documents,changes)&sort(mrp,scheduledStartDate)&limit(0)&_id!="+this.model.id+"&leadingOrder="+this.model.id}),this),r.isLoaded("paintShop")&&(this.paintOrders=o(new f(null,{rqlQuery:"select(mrp,bom)&limit(0)&operations.workCenter=PAINT&leadingOrder="+this.model.id}),this),this.paintOrder=new w({bom:new v}))},defineViews:function(){this.views_={},this.views_.details=new O({model:this.model,delayReasons:this.delayReasons}),this.views_.downtimes=this.downtimes?new C({model:this.model,collection:this.downtimes}):null,this.views_.fapEntries=this.fapEntries?new T({model:this.model,collection:this.fapEntries}):null,this.views_.childOrders=new E({tableClassName:"table-bordered table-hover table-condensed table-striped",model:this.model,collection:this.childOrders,delayReasons:this.delayReasons,panel:{title:this.t("PANEL:TITLE:childOrders"),className:"orders-childOrders",hideEmpty:!0}}),this.views_.operations=new D({model:this.model,showQtyMax:!0}),this.views_.documents=new _({model:this.model}),this.views_.notes=new R({model:this.model}),this.views_.components=new P({model:this.model,linkDocuments:!0,linkPfep:!0}),this.views_.paintComponents=this.paintOrder?new P({model:this.paintOrder,paint:!0,linkPfep:!0}):null,this.views_.eto=new L({model:this.model}),this.views_.changes=new b({model:this.model,delayReasons:this.delayReasons})},defineBindings:function(){this.listenTo(this.paintOrders,"reset",this.onPaintOrdersReset),this.listenTo(this.views_.documents,"documentOpened",this.onDocumentOpened),this.listenTo(this.views_.documents,"documentClosed",this.onDocumentClosed),this.listenTo(this.views_.components,"bestDocumentRequested",this.onBestDocumentRequested),this.listenTo(this.model,"panelToggle",this.renderJumpList),t(window).on("keypress."+this.idPrefix,this.onKeyPress.bind(this)),d.isEnabled()&&(t(window).on("contextmenu."+this.idPrefix,function(e){e.preventDefault()}),this.cancelPinchZoom=function(e){e.touches&&e.touches.length>1&&e.preventDefault()},window.addEventListener("touchstart",this.cancelPinchZoom,{passive:!1}))},load:function(e){return e(this.model.fetch(),this.fapEntries?p.load():null,this.fapEntries?this.fapEntries.fetch({reset:!0}):null,this.downtimes?this.downtimes.fetch({reset:!0}):null,this.childOrders.fetch({reset:!0}),this.paintOrders?this.paintOrders.fetch({reset:!0}):null)},afterRender:function(){this.fapEntries&&p.load(),this.renderJumpList(),this.renderPanelToggles()},onOrderUpdated:function(t){var i=this.model,s=t.change;if(i.id===t._id&&s){var n={},o=i.get("changes");Array.isArray(o)||(o=i.attributes.changes=[]),e.forEach(s.newValues,function(t,s){if("qtyMax"===s){var o={};o[t.operationNo]=t.value,t=e.defaults(o,i.get("qtyMax"))}n[s]="documents"===s?new g(t):t}),"system"!==s.source&&o.push(s),i.set(n),"system"!==s.source&&i.trigger("push:change",s),this.renderPanelToggles()}},onQuantityDoneChanged:function(e){this.model.set("qtyDone",e.qtyDone)},onSynced:function(){this.promised(this.model.fetch())},renderJumpList:function(){var e=this;e.$id("jumpList").remove();var t=d.isEnabled(),i=e.renderPartial(S,{sections:["details","fap","downtimes","childOrders","operations","documents","notes","bom","eto","changes"].map(function(i){var s=e.t("jumpList:"+i).split("_");return{id:i,label:s[0],hotkey:s[1]&&!t?s[1]:""}}).filter(function(t){var i=e.$(".orders-"+t.id).first();return!!i.length&&!i.hasClass("hidden")})});e.$el.append(i)},renderPanelToggles:function(){if(!d.isEnabled()){var e=this,i=JSON.parse(l.getItem("WMES_ORDERS_PANEL_TOGGLES")||"{}");e.getViews().forEach(function(s){if(s!==e.views_.changes){var n=s.$(".table-responsive");if(n.length){var o=n.closest(".panel"),d=o.attr("class").match(/orders-([a-zA-Z]+)/)[1],a=o.find(".panel-heading"),r=n.find("tbody");if(o.attr("data-id",d),!o.hasClass("is-with-actions")){var l=a.text();a.html('<div class="panel-heading-title"></div><div class="panel-heading-actions"></div>'),a.find(".panel-heading-title").text(l),o.addClass("is-with-actions")}var c=a.find(".panel-heading-actions"),h=c.find('.btn[data-action="togglePanel"]'),p=!0===i[d];o.toggleClass("is-expanded",p),r[0].childElementCount>10?(h.length||(h=t('<button class="btn btn-default" type="button" data-action="togglePanel"><i class="fa fa-expand"></i></button>')).appendTo(c),h.toggleClass("active",p)):h.remove()}}})}},onPaintOrdersReset:function(){var t=new v,i=0;this.paintOrders.forEach(function(s){s.get("bom").forEach(function(n){t.add(e.assign({orderNo:s.id,mrp:s.get("mrp"),index:i++},n.toJSON()))})}),this.paintOrder.set("bom",t)},onDocumentOpened:function(e,t){this.views_.components.markDocument(e,t)},onDocumentClosed:function(e,t){this.views_.components.unmarkDocument(e,t)},onBestDocumentRequested:function(e,t){this.views_.documents.openBestDocument(e,t)},onKeyPress:function(e){!n.currentDialog&&"INPUT"!==e.target.tagName&&"TEXTAREA"!==e.target.tagName&&e.key&&/^[A-Za-z0-9]$/.test(e.key)&&this.$id("jumpList").find('a[data-hotkey="'+e.key.toUpperCase()+'"]').click()}})});