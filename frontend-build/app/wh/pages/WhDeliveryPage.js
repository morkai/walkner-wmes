define(["underscore","jquery","app/viewport","app/user","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/core/util/embedded","app/planning/util/shift","app/wh-lines/WhLineCollection","app/wh-setCarts/WhSetCart","app/wh-setCarts/WhSetCartCollection","app/wh/settings","app/wh/WhOrderCollection","app/wh/PlanStatsCollection","app/wh/views/DeliverySectionView","app/wh/views/DeliverySetView","app/wh/views/ForceLineDeliveryView","app/wh/templates/messages","app/wh/templates/delivery/page"],function(e,t,i,s,n,a,d,o,r,l,h,c,p,u,g,m,f,v,w,C,y){"use strict";var S={fmx:"13370011",fmx2:"13370012",kit:"13370021",kit2:"13370022",plat:"13370031",plat2:"13370032",pack:"13370041",pack2:"13370042",dfifo:"13370051",dfifo2:"13370052",dpack:"13370061",dpack2:"13370062",ps:"13370071",ps2:"13370072"};return d.extend({template:y,nlsDomain:"wh",pageId:"wh-delivery",title:function(){return[this.t("BREADCRUMB:base"),this.t("BREADCRUMB:delivery:"+this.options.kind)]},breadcrumbs:[],remoteTopics:{"old.wh.lines.updated":"onLinesUpdated","old.wh.setCarts.updated":"onSetCartsUpdated","planning.stats.updated":"onPlanStatsUpdated"},localTopics:{"socket.connected":function(){this.scheduleLineReload(),this.reload()},"socket.disconnected":function(){clearTimeout(this.timers.lineReload)}},events:{"click #-message":function(){""===document.getSelection().toString()&&this.hideMessage()},"click #-messageOverlay":function(){this.hideMessage()}},initialize:function(){this.keyBuffer="",this.lastLineUpdateAt=0,this.updatedLines={},this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){t(document).off("."+this.idPrefix),t(window).off("."+this.idPrefix),document.body.style.overflow=""},defineModels:function(){this.model=new a({loading:!0,personnelId:s.data.cardUid||""}),this.whSettings=u.bind(this),this.planStats=o(new m,this),this.lines=o(new h(null,{rqlQuery:"limit(0)",paginate:!1}),this),this.setCarts=o(new p(null,{rqlQuery:"limit(0)&status=in=(completing,completed,delivering)",paginate:!1}),this),this.setCarts.completed=new p(null,{paginate:!1}),this.setCarts.pending=new p(null,{paginate:!1}),this.setCarts.delivering=new p(null,{paginate:!1})},defineViews:function(){this.completedView=new f({model:this.model,whSettings:this.whSettings,lines:this.lines,allCarts:this.setCarts,setCarts:this.setCarts.completed,status:"completed",kind:this.options.kind}),this.pendingView=new f({model:this.model,whSettings:this.whSettings,lines:this.lines,allCarts:this.setCarts,setCarts:this.setCarts.pending,status:"pending"}),this.deliveringView=new f({model:this.model,whSettings:this.whSettings,lines:this.lines,allCarts:this.setCarts,setCarts:this.setCarts.delivering,status:"delivering",actions:!r.isEnabled()}),this.setView("#-completed",this.completedView),this.setView("#-pending",this.pendingView),this.setView("#-delivering",this.deliveringView)},defineBindings:function(){var e=this;e.listenTo(e.deliveringView,"forceLineClicked",e.showForceLineDialog),e.once("afterRender",function(){e.listenTo(e.model,"resolveAction",e.resolveAction),e.listenTo(e.model,"continueDelivery",e.handleContinueDelivery),e.listenTo(e.model,"change:loading",e.onLoadingChanged),e.listenTo(e.lines,"remove add change",e.onLineUpdated),e.listenTo(e.setCarts,"remove",e.onSetCartRemoved),e.listenTo(e.setCarts,"add",e.onSetCartAdded),e.listenTo(e.setCarts,"change",e.onSetCartChanged),e.listenTo(e.whSettings,"change",e.onSettingChanged),e.listenTo(e.planStats,"change",e.onPlanStatsChanged),e.model.set("loading",!1),window.parent.postMessage({type:"ready",app:window.WMES_APP_ID},"*"),clearTimeout(e.timers.scheduleLineUpdate),e.timers.scheduleLineUpdate=setTimeout(e.scheduleLineUpdate.bind(e,null,!1),2e4)}),t(window).on("keydown."+e.idPrefix,e.onWindowKeyDown.bind(e)).on("keypress."+e.idPrefix,e.onWindowKeyPress.bind(e)).on("resize."+e.idPrefix,e.onWindowResize.bind(e))},load:function(e){return e(this.planStats.fetch({reset:!0}),this.lines.fetch({reset:!0}),this.setCarts.fetch({reset:!0}))},reload:function(){var e=this;clearTimeout(e.timers.reload),e.model.set("loading",!0);var i=e.promised(t.when(e.whSettings.fetch({reset:!0}),e.planStats.fetch({reset:!0}),e.lines.fetch({reset:!0}),e.setCarts.fetch({reset:!0})));i.done(function(){e.model.set("loading",!1)}),i.fail(function(){e.timers.reload=setTimeout(e.reload.bind(e),1e4)})},beforeRender:function(){document.body.style.overflow="hidden",clearTimeout(this.timers.handleUpdatedLines),this.timers.handleUpdatedLines=null,this.lastLineUpdateAt=0,this.updatedLines={}},afterRender:function(){this.resize(),r.render(this)},onLinesUpdated:function(e){this.model.get("loading")||this.promised(this.lines.handleUpdate(e))},onLineUpdated:function(e){this.scheduleLineUpdate(e.id,!1)},scheduleLineUpdate:function(e,t){this.updatedLines[e]=!0;var i=Date.now()-this.lastLineUpdateAt;t?(i=1,clearTimeout(this.timers.handleUpdatedLines),this.timers.handleUpdatedLines=null):i>1e4&&(i=666,clearTimeout(this.timers.handleUpdatedLines),this.timers.handleUpdatedLines=null),this.timers.handleUpdatedLines||(this.timers.handleUpdatedLines=setTimeout(this.handleUpdatedLines.bind(this),i))},onSetCartsUpdated:function(e){var t=this;if(!t.model.get("loading")){var i=[];(e.deleted||[]).forEach(function(e){t.setCarts.remove(e._id)}),(e.added||[]).forEach(function(e){e.kind===t.options.kind&&"delivered"!==e.status&&t.setCarts.add(c.parse(e))}),(e.updated||[]).forEach(function(e){if(e.status&&"delivered"===e.status)t.setCarts.remove(e._id);else{var s=t.setCarts.get(e._id);s?s.set(c.parse(e)):c.isPartial(e)?!e.status||e.kind&&e.kind!==t.options.kind||i.push(e._id):e.kind===t.options.kind&&t.setCarts.add(c.parse(e))}}),i.length&&t.loadPartialSetCarts(i)}},onPlanStatsUpdated:function(e){this.planStats.update(e.plan,e.stats)},onPlanStatsChanged:function(){this.scheduleLineUpdate(null,!1)},onLoadingChanged:function(){this.model.get("loading")||this.reset()},onSettingChanged:function(){this.scheduleLineUpdate(null,!1)},utcNow:function(){return n.getMoment().utc(!0).valueOf()},reset:function(){var e=this,t=[],i=[],s=[],n=e.utcNow();e.setCarts.forEach(function(a){a.get("kind")===e.options.kind&&("delivering"===a.get("status")?s.push(a):e.isPendingSetCart(a,n)?i.push(a):t.push(a))}),e.setCarts.completed.reset(t),e.setCarts.pending.reset(i),e.setCarts.delivering.reset(s)},onSetCartRemoved:function(e){this.setCarts.completed.remove(e.id),this.setCarts.pending.remove(e.id),this.setCarts.delivering.remove(e.id)},onSetCartAdded:function(e){e.get("kind")===this.options.kind&&("delivering"===e.get("status")?this.setCarts.delivering.add(e):this.isPendingSetCart(e)?this.setCarts.pending.add(e):this.setCarts.completed.add(e))},onSetCartChanged:function(e){if(e.get("kind")===this.options.kind){var t=this.setCarts,i=e.get("status");"completing"===i||"completed"===i?(t.delivering.remove(e.id),this.isPendingSetCart(e)?(t.completed.remove(e.id),t.pending.add(e)):(t.pending.remove(e.id),t.completed.add(e))):(t.completed.remove(e.id),t.pending.remove(e.id),t.delivering.add(e))}},isPendingSetCart:function(e){var t=e.get("status");if("completing"===t)return!1;var i=e.get("pending");return!(!i||e.get("deliveringAt"))||(!(i||!e.get("forced")||"completed"!==t)||this.isMinTimeForDelivery(e)&&!this.hasEarlierDiffKindSetCart(e))},isMinTimeForDelivery:function(e){var t=this,i=t.whSettings.getMaxMinTimeForDelivery(e.get("orders"));return e.get("lines").some(function(e){var s=t.lines.get(e);return!!s&&s.get("available").time<i})},hasEarlierDiffKindSetCart:function(t){var i=this.options.kind,s=t.get("date"),n=t.get("set"),a=Date.parse(t.get("startTime")),d=t.get("lines");return this.setCarts.some(function(t){var o=t.get("status");return!(t.get("kind")===i&&"completed"===o||"delivering"===o||t.get("set")===n&&t.get("date")===s||!e.intersection(d,t.get("lines")).length)&&Date.parse(t.get("startTime"))<a})},loadPartialSetCarts:function(e){var t=this,i=t.ajax({url:t.setCarts.url+"?_id=in=("+e.join(",")+")&kind="+t.options.kind});i.fail(function(){console.error("Failed to load partial set carts:",i),window.location.reload()}),i.done(function(e){e.collection&&t.onSetCartsUpdated({updated:e.collection})})},handleUpdatedLines:function(){var e=this,t=e.setCarts;clearTimeout(e.timers.handleUpdatedLines),e.timers.handleUpdatedLines=null,e.updatedLines={},e.lastLineUpdateAt=Date.now();var i={add:[],remove:[]},s={add:[],remove:[]},n=e.utcNow();t.completed.forEach(function(t){e.isPendingSetCart(t,n)&&(s.remove.push(t),i.add.push(t))}),t.pending.forEach(function(t){e.isPendingSetCart(t,n)||(i.remove.push(t),s.add.push(t))}),t.completed.remove(s.remove),t.pending.remove(i.remove),t.completed.add(s.add),t.pending.add(i.add),e.completedView.highlight(),e.pendingView.highlight(),clearTimeout(e.timers.scheduleLineUpdate),e.timers.scheduleLineUpdate=setTimeout(e.scheduleLineUpdate.bind(e,null,!1),2e4)},onWindowKeyDown:function(e){"Escape"===e.key&&this.hideMessage()},onWindowKeyPress:function(e){var t=e.target.tagName;e.keyCode>=48&&e.keyCode<=57&&"INPUT"!==t&&"TEXTAREA"!==t&&(this.keyBuffer+=(e.keyCode-48).toString()),clearTimeout(this.timers.handleKeyBuffer),this.timers.handleKeyBuffer=setTimeout(this.handleKeyBuffer.bind(this),200)},onWindowResize:function(){this.resize()},resize:function(){var e=t(".hd"),i=t(".ft"),s=this.$(".wh-delivery-section-hd").first(),n=this.$(".wh-delivery-section-ft").first(),a=window.innerHeight-30;e.length&&!e.hasClass("hidden")&&(a-=e.outerHeight()),i.length&&!i.hasClass("hidden")&&(a-=i.outerHeight()+15),a-=s.outerHeight(!0)+n.outerHeight(!0),this.$(".wh-delivery-section-bd").css("height",a+"px")},handleKeyBuffer:function(){this.keyBuffer.length>=6&&this.resolveAction(this.keyBuffer),this.keyBuffer=""},resolveAction:function(e,t){var s=this;if(!s.acting){"production"!==window.ENV&&S[e]&&(e=S[e]);var n=i.currentDialog;if(n instanceof v&&n.model.personnelId===e)n.finish();else if(n instanceof w)n.getCard()===e?n.$id("submit").click():n.setCard(e);else{i.closeAllDialogs(),s.acting=!0,s.showMessage("info",0,"resolvingAction",{personnelId:e,hideOnClick:!1});var a=s.promised(g.act(null,"resolveAction",Object.assign({source:"delivery",kind:s.options.kind,personnelId:e},t)));a.fail(function(){s.showErrorMessage(a,e)}),a.done(function(e){s.hideMessage(!1,!0),s.handleActionResult(e)}),a.always(function(){s.acting=!1,s.model.set("personnelId",e)})}}},showErrorMessage:function(e,t){var i=e.responseJSON&&e.responseJSON.error||{},s=i.code;"number"==typeof s&&(s=null,i.code=null),e.status?this.t.has("msg:resolveAction:"+e.status)?s="resolveAction:"+e.status:this.t.has("msg:"+s)||(s="genericFailure"):s="connectionFailure",this.showMessage("error",5e3,"text",{text:this.t("msg:"+s,{errorCode:i.code||i.message||"?",personnelId:t})})},handleActionResult:function(e){switch(e.result){case"deliveryStarted":this.handleDeliveryStarted(e);break;case"continueDelivery":this.handleContinueDelivery(e);break;case"nothingToDeliver":this.showMessage("warning",2500,"text",{text:this.t("msg:nothingToDeliver")});break;default:console.warn("Unknown action result: %s",e.result,e)}},handleContinueDelivery:function(e){var t=this,i=new p;e.setCarts.forEach(function(e){var s=t.setCarts.get(e);s&&i.add(s)}),t.showSetDialog(i,e.user,e.personnelId)},handleDeliveryStarted:function(e){var t=new p(e.setCarts);this.showSetDialog(t,e.user,e.personnelId,e.completedSapOrders)},showSetDialog:function(t,s,n,a){if(t.length){var d=new v({model:{pendingSetCarts:this.setCarts.pending,setCarts:t,personnelId:n,completedSapOrders:a||[]}});this.listenTo(d,"failure",function(e){this.showErrorMessage(e,n)}),this.listenTo(d,"success",function(){this.showMessage("success",2500,"text",{text:this.t("msg:delivered")})});var o=this.t("delivery:set:title",{kind:t.at(0).get("kind")});s&&(o+=' <span class="wh-set-user"><i class="fa fa-user"></i><span>'+e.escape(s.label)+"</span></span>"),i.closeAllDialogs(),i.showDialog(d,o)}else console.warn("Showing set dialog with no carts?!?!")},showMessage:function(e,t,i,s){this.timers.hideMessage&&clearTimeout(this.timers.hideMessage);var n=r.isEnabled(),a=this.$id("messageOverlay"),d=this.$id("message"),o="block"===a[0].style.display,l=i;s=Object.assign({},{embedded:n},s),C[i]&&(l=this.renderPartialHtml(C[i],s)),d.stop(!0,!0),a.css("display","block"),d.html(l).removeClass("message-error message-warning message-success message-info").addClass("message-"+e),o?d.css({marginTop:d.outerHeight()/2*-1+"px",marginLeft:d.outerWidth()/2*-1+"px"}):(d.css({display:"block",marginLeft:"-5000px"}),d.css({display:n?"block":"none",marginTop:d.outerHeight()/2*-1+"px",marginLeft:d.outerWidth()/2*-1+"px"}),n||d.fadeIn()),t>0&&(this.timers.hideMessage=setTimeout(this.hideMessage.bind(this),t))},hideMessage:function(e,t){var i=this;clearTimeout(i.timers.hideMessage);var s=i.$id("messageOverlay");if(s.length&&"none"!==s[0].style.display){var n=i.$id("message");(t||!1!==n.data("hideOnClick"))&&(!0===e||r.isEnabled()?a():n.fadeOut(a))}function a(){s.css("display","none"),n.css("display","none"),i.timers&&(i.timers.hideMessage=null)}},scheduleLineReload:function(){var e=this;clearTimeout(e.timers.lineReload),e.timers.lineReload=setTimeout(function(){e.promised(e.lines.fetch())},2e4)},showForceLineDialog:function(){var e=this,t=new w({model:e.model,setCarts:e.setCarts});e.listenTo(t,"picked",function(t){i.closeAllDialogs(),e.broker.subscribe("viewport.dialog.hidden").setLimit(1).on("message",function(){e.resolveAction(t.card,{forceLine:t.line})})}),i.showDialog(t,e.t("delivery:forceLine:title"))}})});