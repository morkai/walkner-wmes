define(["jquery","app/user","app/time","app/core/View","app/core/views/PaginationView","app/orders/views/OrderChangesView","app/reports/templates/clip/orders","app/reports/templates/clip/orderRow"],function(e,t,n,s,i,a,o,r){"use strict";var l={pending:"danger",started:"info",finished:"success",analysis:"warning"};return s.extend({template:o,events:{"click tr[data-id]":function(e){"A"!==e.target.tagName&&this.showOrderChanges(e.currentTarget.dataset.id,e.target.classList.contains("reports-2-orders-delayReason"))}},initialize:function(){var t=this.collection;this.orderChangesView=null,this.paginationView=new i({replaceUrl:!0,model:t.paginationData}),this.setView(".pagination-container",this.paginationView),this.listenTo(t,"change:delayReason change:delayComponent change:m4",this.onDelayReasonChange),this.listenTo(t,"change:comment",this.onCommentChange),this.listenTo(t,"push:change",this.onChangePush),this.listenTo(t.paginationData,"change:page",this.scrollTop),this.listenTo(t.displayOptions.settings,"change",this.onSettingChange),e(document).on("")},destroy:function(){this.hideOrderChanges()},serialize:function(){return{idPrefix:this.idPrefix,renderOrderRow:r,canViewOrders:t.isAllowedTo("ORDERS:VIEW"),dateProperty:this.collection.displayOptions.settings.getValue("clip.dateProperty","finishDate"),orders:this.collection.map(this.serializeOrder,this)}},serializeOrder:function(e){var t=e.get("productionStatus"),s=e.get("productionTime"),i="CNF"===t?"full":"PCNF"===t?"partial":"none",a=e.get("endToEndStatus"),o=e.get("endToEndTime"),r="DLV"===a?"full":"PDLV"===a?"partial":"none",d=this.delayReasons.get(e.get("delayReason")),h=e.get(this.collection.displayOptions.settings.getValue("clip.dateProperty","finishDate")),g=e.get("mrp"),c="success";if(e.get("confirmed")||("none"===i||"none"===r?c="danger":("partial"===i||"partial"===r)&&(c="warning")),h){var p=n.getMoment(h),m=this.collection.query.get("offset1")||0;m&&p.add(m,"days"),h=p.format("L")}else h="";return{className:c,no:e.id,name:e.get("name"),mrp:g,qty:(e.get("qtyDone")||0).toLocaleString()+"/"+(e.get("qty")||0).toLocaleString(),date:h,cnfStatus:t||"",cnfClassName:i,cnfTime:s?n.format(s,"L, HH:mm"):"",dlvStatus:a||"",dlvClassName:r,dlvTime:o?n.format(o,"L, HH:mm"):"",delayReason:d?d.getLabel():"",delayComponent:e.get("delayComponent"),m4:e.get("m4"),drm:e.get("drm"),eto:e.get("eto"),comment:e.get("comment"),planner:this.planners.getLabel(g),faps:(e.get("faps")||[]).map(function(e){return e.label=l[e.status],e})}},beforeRender:function(){this.stopListening(this.collection,"request"),this.stopListening(this.collection,"sync")},afterRender:function(){this.listenTo(this.collection,"request",this.onCollectionRequest),this.listenTo(this.collection,"sync",this.onCollectionSync),"0"!==localStorage.getItem("WMES_NO_SYSTEM_CHANGES")&&this.$el.addClass("clip-no-system-changes")},renderOrderRows:function(){for(var e="",n=t.isAllowedTo("ORDERS:VIEW"),s=0,i=this.collection.length;s<i;++s)e+=r({canViewOrders:n,order:this.serializeOrder(this.collection.at(s))});this.hideOrderChanges(),this.$id("orders").html(e)},scrollTop:function(){var t=this.$el.offset().top-14,n=e(".navbar-fixed-top");n.length&&(t-=n.outerHeight()),window.scrollY>t&&e("html, body").stop(!0,!1).animate({scrollTop:t},"fast")},showOrderChanges:function(e,t){var n=this,s=n.$('tr[data-id="'+e+'"]'),i=s.next(".reports-2-changes").length;if(n.hideOrderChanges(),!i){var a=n.collection.get(e);if(a.get("changes"))return n.renderOrderChanges(a,s,t);n.req=n.ajax({url:"/orders/"+e+"?select(changes)"}),n.$el.css("cursor","wait"),n.req.done(function(e){a.set("changes",e.changes),n.renderOrderChanges(a,s,t)}),n.req.always(function(){n.$el.css("cursor","")})}},renderOrderChanges:function(t,n,s){var i=e('<tr class="reports-2-changes hidden"><td colspan="999"></td></tr>'),o=i.find("td");this.orderChangesView=new a({model:t,delayReasons:this.delayReasons,showPanel:!1}),o.append(this.orderChangesView.el),i.insertAfter(n),this.orderChangesView.render(),i.removeClass("hidden"),s&&i.find('input[name="delayReason"]').select2("focus");var r=e('<button class="btn btn-default btn-lg clip-toggleSystemChanges"></button>').attr({id:this.idPrefix+"-toggleSystemChanges"}).text(this.t("reports","clip:toggleSystemChanges")).toggleClass("active","0"!==localStorage.getItem("WMES_NO_SYSTEM_CHANGES")).on("click",this.toggleSystemChanges.bind(this));this.$el.append(r)},toggleSystemChanges:function(){var e="0"===("0"===localStorage.getItem("WMES_NO_SYSTEM_CHANGES")?"0":"1")?"1":"0";localStorage.setItem("WMES_NO_SYSTEM_CHANGES",e),this.$id("toggleSystemChanges").toggleClass("active","1"===e),this.$el.toggleClass("clip-no-system-changes","1"===e)},hideOrderChanges:function(){if(this.req&&(this.req.abort(),this.req=null),null!==this.orderChangesView){var e=this.orderChangesView.$el.closest(".reports-2-changes");this.orderChangesView.remove(),e.remove(),this.orderChangesView=null}this.$id("toggleSystemChanges").remove()},onCollectionRequest:function(){this.$id("empty").addClass("hidden")},onCollectionSync:function(){this.$id("empty").toggleClass("hidden",0!==this.collection.length),this.$id("orders").toggleClass("hidden",0===this.collection.length),this.renderOrderRows(),this.paginationView.render()},onDelayReasonChange:function(e){var t=this.delayReasons.get(e.get("delayReason")),n=e.get("delayComponent"),s="";if(t){s=t.getLabel()+" ("+this.t("orders","m4:"+e.get("m4"));var i=t.get("drm")[e.get("m4")];i&&(s+="; "+i),n&&(s+="; "+n),s+=")"}this.$id("orders").find('tr[data-id="'+e.id+'"]').find(".reports-2-orders-delayReason").text(s)},onSettingChange:function(e){"reports.clip.dateProperty"===e.id&&this.$id("dateProperty").html(this.t("orders:"+e.getValue()))}})});