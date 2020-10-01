define(["underscore","jquery","app/viewport","app/user","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/core/util/embedded","app/planning/util/shift","app/wh-lines/WhLineCollection","app/wh-setCarts/WhSetCart","app/wh-setCarts/WhSetCartCollection","app/wh/settings","app/wh/WhOrderCollection","app/wh/PlanStatsCollection","app/wh/views/DeliverySectionView","app/wh/views/DeliverySetView","app/wh/views/ForceLineDeliveryView","app/wh/templates/messages","app/wh/templates/delivery/page"],function(e,t,i,s,n,a,o,d,r,l,h,c,u,p,g,f,m,v,w,C,S){"use strict";var y={fmx:"13370011",fmx2:"13370012",kit:"13370021",kit2:"13370022",plat:"13370031",plat2:"13370032",pack:"13370041",pack2:"13370042",dfifo:"13370051",dfifo2:"13370052",dpack:"13370061",dpack2:"13370062",ps:"13370071",ps2:"13370072"};return o.extend({template:S,nlsDomain:"wh",pageId:"wh-delivery",title:function(){return[this.t("BREADCRUMB:base"),this.t("BREADCRUMB:delivery:"+this.options.kind)]},breadcrumbs:[],remoteTopics:{"old.wh.lines.updated":"onLinesUpdated","old.wh.setCarts.updated":"onSetCartsUpdated","planning.stats.updated":"onPlanStatsUpdated"},localTopics:{"socket.connected":function(){this.scheduleLineReload(),this.reload()},"socket.disconnected":function(){clearTimeout(this.timers.lineReload)}},events:{"click #-message":function(){""===document.getSelection().toString()&&this.hideMessage()},"click #-messageOverlay":function(){this.hideMessage()}},initialize:function(){this.keyBuffer="",this.lastLineUpdateAt=0,this.updatedLines={},this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){t(document).off("."+this.idPrefix),t(window).off("."+this.idPrefix),document.body.style.overflow=""},defineModels:function(){this.model=new a({loading:!0,personnelId:s.data.cardUid||""}),this.whSettings=p.bind(this),this.planStats=d(new f,this),this.lines=d(new h(null,{rqlQuery:"limit(0)",paginate:!1}),this),this.setCarts=d(new u(null,{rqlQuery:"limit(0)&status=in=(completing,completed,delivering)&kind="+this.options.kind,paginate:!1}),this),this.setCarts.completed=new u(null,{paginate:!1}),this.setCarts.pending=new u(null,{paginate:!1}),this.setCarts.delivering=new u(null,{paginate:!1})},defineViews:function(){this.completedView=new m({model:this.model,whSettings:this.whSettings,lines:this.lines,setCarts:this.setCarts.completed,status:"completed",kind:this.options.kind}),this.pendingView=new m({model:this.model,whSettings:this.whSettings,lines:this.lines,setCarts:this.setCarts.pending,status:"pending"}),this.deliveringView=new m({model:this.model,whSettings:this.whSettings,lines:this.lines,setCarts:this.setCarts.delivering,status:"delivering",actions:!0}),this.setView("#-completed",this.completedView),this.setView("#-pending",this.pendingView),this.setView("#-delivering",this.deliveringView)},defineBindings:function(){var e=this;e.listenTo(e.deliveringView,"forceLineClicked",e.showForceLineDialog),e.once("afterRender",function(){e.listenTo(e.model,"resolveAction",e.resolveAction),e.listenTo(e.model,"continueDelivery",e.handleContinueDelivery),e.listenTo(e.model,"change:loading",e.onLoadingChanged),e.listenTo(e.lines,"remove add change",e.onLineUpdated),e.listenTo(e.setCarts,"remove",e.onSetCartRemoved),e.listenTo(e.setCarts,"add",e.onSetCartAdded),e.listenTo(e.setCarts,"change",e.onSetCartChanged),e.listenTo(e.whSettings,"change",e.onSettingChanged),e.listenTo(e.planStats,"change",e.onPlanStatsChanged),e.model.set("loading",!1),window.parent.postMessage({type:"ready",app:window.WMES_APP_ID},"*"),clearTimeout(e.timers.scheduleLineUpdate),e.timers.scheduleLineUpdate=setTimeout(e.scheduleLineUpdate.bind(e,null,!1),2e4)}),t(window).on("keydown."+e.idPrefix,e.onWindowKeyDown.bind(e)).on("keypress."+e.idPrefix,e.onWindowKeyPress.bind(e)).on("resize."+e.idPrefix,e.onWindowResize.bind(e))},load:function(e){return e(this.planStats.fetch({reset:!0}),this.lines.fetch({reset:!0}),this.setCarts.fetch({reset:!0}))},reload:function(){var e=this;clearTimeout(e.timers.reload),e.model.set("loading",!0);var i=e.promised(t.when(e.whSettings.fetch({reset:!0}),e.planStats.fetch({reset:!0}),e.lines.fetch({reset:!0}),e.setCarts.fetch({reset:!0})));i.done(function(){e.model.set("loading",!1)}),i.fail(function(){e.timers.reload=setTimeout(e.reload.bind(e),1e4)})},beforeRender:function(){document.body.style.overflow="hidden",clearTimeout(this.timers.handleUpdatedLines),this.timers.handleUpdatedLines=null,this.lastLineUpdateAt=0,this.updatedLines={}},afterRender:function(){this.resize(),r.render(this)},onLinesUpdated:function(e){this.model.get("loading")||this.promised(this.lines.handleUpdate(e))},onLineUpdated:function(e){this.scheduleLineUpdate(e.id,!1)},scheduleLineUpdate:function(e,t){this.updatedLines[e]=!0;var i=Date.now()-this.lastLineUpdateAt;t?(i=1,clearTimeout(this.timers.handleUpdatedLines),this.timers.handleUpdatedLines=null):i>1e4&&(i=666,clearTimeout(this.timers.handleUpdatedLines),this.timers.handleUpdatedLines=null),this.timers.handleUpdatedLines||(this.timers.handleUpdatedLines=setTimeout(this.handleUpdatedLines.bind(this),i))},onSetCartsUpdated:function(e){var t=this;if(!t.model.get("loading")){var i=[];(e.deleted||[]).forEach(function(e){t.setCarts.remove(e._id)}),(e.added||[]).forEach(function(e){e.kind===t.options.kind&&"delivered"!==e.status&&t.setCarts.add(c.parse(e))}),(e.updated||[]).forEach(function(e){if(e.status&&"delivered"===e.status)t.setCarts.remove(e._id);else{var s=t.setCarts.get(e._id);s?s.set(c.parse(e)):c.isPartial(e)?!e.status||e.kind&&e.kind!==t.options.kind||i.push(e._id):e.kind===t.options.kind&&t.setCarts.add(c.parse(e))}}),i.length&&t.loadPartialSetCarts(i)}},onPlanStatsUpdated:function(e){this.planStats.update(e.plan,e.stats)},onPlanStatsChanged:function(){this.scheduleLineUpdate(null,!1)},onLoadingChanged:function(){this.model.get("loading")||this.reset()},onSettingChanged:function(){this.scheduleLineUpdate(null,!1)},utcNow:function(){return n.getMoment().utc(!0).valueOf()},reset:function(){var e=this,t=[],i=[],s=[],n=e.utcNow();e.setCarts.forEach(function(a){"delivering"===a.get("status")?s.push(a):e.isPendingSetCart(a,n)?i.push(a):t.push(a)}),e.setCarts.completed.reset(t),e.setCarts.pending.reset(i),e.setCarts.delivering.reset(s)},onSetCartRemoved:function(e){this.setCarts.completed.remove(e.id),this.setCarts.pending.remove(e.id),this.setCarts.delivering.remove(e.id)},onSetCartAdded:function(e){"delivering"===e.get("status")?this.setCarts.delivering.add(e):this.isPendingSetCart(e)?this.setCarts.pending.add(e):this.setCarts.completed.add(e)},onSetCartChanged:function(e){var t=this.setCarts,i=e.get("status");"completing"===i||"completed"===i?(t.delivering.remove(e.id),this.isPendingSetCart(e)?(t.completed.remove(e.id),t.pending.add(e)):(t.pending.remove(e.id),t.completed.add(e))):(t.completed.remove(e.id),t.pending.remove(e.id),t.delivering.add(e))},isPendingSetCart:function(e,t){var i=this;if("completing"===e.get("status"))return!1;if(e.get("pending")&&!e.get("deliveringAt"))return!0;t||(t=this.utcNow());var s=i.whSettings.getMinTimeForDelivery(),a=i.whSettings.getMaxDeliveryStartTime(),o=new Date(e.get("startTime")),d=o.getTime()-t<a,r=6+a/6e4/60;return e.get("lines").some(function(e){var h=i.lines.get(e);if(!h)return!1;if(h.get("available").time>=s)return!1;if(d||h.get("working"))return!0;var c=o.getUTCHours();if(c<6||c>=r)return!1;var u=i.planStats.getFirstWorkingPlanBefore(o);if(!u)return!1;for(var p=n.utc.getMoment(u.get("date").valueOf()),g=u.get("workingShifts"),f=3;f>0;--f)if(g[f]){p.hours(l.getStartHourFromShiftNo(f));break}return p.add(l.SHIFT_DURATION-a,"ms"),t>=p.valueOf()})},loadPartialSetCarts:function(e){var t=this,i=t.ajax({url:t.setCarts.url+"?_id=in=("+e.join(",")+")&kind="+t.options.kind});i.fail(function(){console.error("Failed to load partial set carts:",i),window.location.reload()}),i.done(function(e){e.collection&&t.onSetCartsUpdated({updated:e.collection})})},handleUpdatedLines:function(){var e=this,t=e.setCarts;clearTimeout(e.timers.handleUpdatedLines),e.timers.handleUpdatedLines=null,e.updatedLines={},e.lastLineUpdateAt=Date.now();var i={add:[],remove:[]},s={add:[],remove:[]},n=e.utcNow();t.completed.forEach(function(t){e.isPendingSetCart(t,n)&&(s.remove.push(t),i.add.push(t))}),t.pending.forEach(function(t){e.isPendingSetCart(t,n)||(i.remove.push(t),s.add.push(t))}),t.completed.remove(s.remove),t.pending.remove(i.remove),t.completed.add(s.add),t.pending.add(i.add),e.completedView.highlight(),e.pendingView.highlight(),clearTimeout(e.timers.scheduleLineUpdate),e.timers.scheduleLineUpdate=setTimeout(e.scheduleLineUpdate.bind(e,null,!1),2e4)},onWindowKeyDown:function(e){"Escape"===e.key&&this.hideMessage()},onWindowKeyPress:function(e){var t=e.target.tagName;e.keyCode>=48&&e.keyCode<=57&&"INPUT"!==t&&"TEXTAREA"!==t&&(this.keyBuffer+=(e.keyCode-48).toString()),clearTimeout(this.timers.handleKeyBuffer),this.timers.handleKeyBuffer=setTimeout(this.handleKeyBuffer.bind(this),200)},onWindowResize:function(){this.resize()},resize:function(){var e=t(".hd"),i=t(".ft"),s=this.$(".wh-delivery-section-hd").first(),n=this.$(".wh-delivery-section-ft").first(),a=window.innerHeight-30;e.length&&!e.hasClass("hidden")&&(a-=e.outerHeight()),i.length&&!i.hasClass("hidden")&&(a-=i.outerHeight()+15),a-=s.outerHeight(!0)+n.outerHeight(!0),this.$(".wh-delivery-section-bd").css("height",a+"px")},handleKeyBuffer:function(){this.keyBuffer.length>=6&&this.resolveAction(this.keyBuffer),this.keyBuffer=""},resolveAction:function(e,t){var s=this;if(!s.acting){"production"!==window.ENV&&y[e]&&(e=y[e]);var n=i.currentDialog;if(n instanceof v&&n.model.personnelId===e)n.finish();else if(n instanceof w)n.getCard()===e?n.$id("submit").click():n.setCard(e);else{i.closeAllDialogs(),s.acting=!0,s.showMessage("info",0,"resolvingAction",{personnelId:e});var a=s.promised(g.act(null,"resolveAction",Object.assign({source:"delivery",kind:s.options.kind,personnelId:e},t)));a.fail(function(){s.showErrorMessage(a,e)}),a.done(function(e){s.hideMessage(),s.handleActionResult(e)}),a.always(function(){s.acting=!1,s.model.set("personnelId",e)})}}},showErrorMessage:function(e,t){var i=e.responseJSON&&e.responseJSON.error||{},s=i.code;"number"==typeof s&&(s=null,i.code=null),e.status?this.t.has("msg:resolveAction:"+e.status)?s="resolveAction:"+e.status:this.t.has("msg:"+s)||(s="genericFailure"):s="connectionFailure",this.showMessage("error",5e3,"text",{text:this.t("msg:"+s,{errorCode:i.code||i.message||"?",personnelId:t})})},handleActionResult:function(e){switch(e.result){case"deliveryStarted":this.handleDeliveryStarted(e);break;case"continueDelivery":this.handleContinueDelivery(e);break;case"nothingToDeliver":this.showMessage("warning",2500,"text",{text:this.t("msg:nothingToDeliver")});break;default:console.warn("Unknown action result: %s",e.result,e)}},handleContinueDelivery:function(e){var t=this,i=new u;e.setCarts.forEach(function(e){var s=t.setCarts.get(e);s&&i.add(s)}),t.showSetDialog(i,e.user,e.personnelId)},handleDeliveryStarted:function(e){var t=new u(e.setCarts);this.showSetDialog(t,e.user,e.personnelId,e.completedSapOrders)},showSetDialog:function(t,s,n,a){if(t.length){var o=new v({model:{pendingSetCarts:this.setCarts.pending,setCarts:t,personnelId:n,completedSapOrders:a||[]}});this.listenTo(o,"failure",function(e){this.showErrorMessage(e,n)}),this.listenTo(o,"success",function(){this.showMessage("success",2500,"text",{text:this.t("msg:delivered")})});var d=this.t("delivery:set:title",{kind:t.at(0).get("kind")});s&&(d+=' <span class="wh-set-user"><i class="fa fa-user"></i><span>'+e.escape(s.label)+"</span></span>"),i.closeAllDialogs(),i.showDialog(o,d)}else console.warn("Showing set dialog with no carts?!?!")},showMessage:function(e,t,i,s){this.timers.hideMessage&&clearTimeout(this.timers.hideMessage);var n=this.$id("messageOverlay"),a=this.$id("message"),o="block"===n[0].style.display,d=i;C[i]&&(d=this.renderPartialHtml(C[i],s||{})),a.stop(!0,!0),n.css("display","block"),a.html(d).removeClass("message-error message-warning message-success message-info").addClass("message-"+e),o?a.css({marginTop:a.outerHeight()/2*-1+"px",marginLeft:a.outerWidth()/2*-1+"px"}):(a.css({display:"block",marginLeft:"-5000px"}),a.css({display:"none",marginTop:a.outerHeight()/2*-1+"px",marginLeft:a.outerWidth()/2*-1+"px"}),a.fadeIn()),t>0&&(this.timers.hideMessage=setTimeout(this.hideMessage.bind(this),t))},hideMessage:function(){var e=this;clearTimeout(e.timers.hideMessage);var t=e.$id("messageOverlay");if(t.length&&"none"!==t[0].style.display){var i=e.$id("message");i.fadeOut(function(){t.css("display","none"),i.css("display","none"),e.timers&&(e.timers.hideMessage=null)})}},scheduleLineReload:function(){var e=this;clearTimeout(e.timers.lineReload),e.timers.lineReload=setTimeout(function(){e.promised(e.lines.fetch())},2e4)},showForceLineDialog:function(){var e=this,t=new w({model:e.model,setCarts:e.setCarts});e.listenTo(t,"picked",function(t){i.closeAllDialogs(),e.broker.subscribe("viewport.dialog.hidden").setLimit(1).on("message",function(){e.resolveAction(t.card,{forceLine:t.line})})}),i.showDialog(t,e.t("delivery:forceLine:title"))}})});