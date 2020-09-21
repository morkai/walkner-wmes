define(["underscore","jquery","app/i18n","app/user","app/viewport","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/core/util/embedded","app/paintShop/views/PaintShopDatePickerView","app/planning/Plan","app/planning/PlanSettings","app/planning/PlanDisplayOptions","app/production/views/VkbView","app/wh-lines/WhLineCollection","../settings","../WhOrderCollection","../WhPickupStatus","../views/WhPickupFilterView","../views/WhPickupListView","../views/WhPickupSetView","../views/WhPickupStatusView","../views/DowntimePickerView","../views/BlockedPickupView","../views/ForceLinePickupView","../templates/messages","app/wh/templates/pickup/page","app/wh/templates/resolveAction","app/planning/templates/planLegend"],function(e,t,s,i,n,a,o,r,d,l,h,c,p,u,f,g,w,m,v,k,y,S,b,O,D,L,P,T,C,A){"use strict";var M={fmx:"13370011",fmx2:"13370012",kit:"13370021",kit2:"13370022",plat:"13370031",plat2:"13370032",pack:"13370041",pack2:"13370042",dfifo:"13370051",dfifo2:"13370052",dpack:"13370061",dpack2:"13370062",ps:"13370071",ps2:"13370072"};return r.extend({template:T,modelProperty:"whOrders",layoutName:"page",breadcrumbs:function(){var e={href:"#wh/pickup/"+this.plan.id,label:this.plan.getLabel(),template:function(e){return'<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+e.href+'" data-action="showPicker">'+e.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}};return l.isEnabled()?[this.t("BREADCRUMB:pickup"),e]:[this.t("BREADCRUMB:base"),e,this.t("BREADCRUMB:pickup")]},actions:function(){var e=this,t={label:e.t("pickup:forceLine:action"),icon:"crosshairs",privileges:["WH:MANAGE"],callback:function(){return e.showForceLineDialog(),!1}},s={label:e.t("PAGE_ACTION:legend"),icon:"question-circle",callback:function(){return e.toggleLegend(this.querySelector(".btn")),!1}};return l.isEnabled()?[t,s]:[{template:function(){return e.renderPartialHtml(C,{pattern:"production"!==window.ENV?"":"^[0-9]{5,}$",value:e.lastPersonnelId||i.data.cardUid})},afterRender:function(t){t.find("form").on("submit",function(){return e.resolveAction(t.find('input[name="card"]').val()),!1})}},t,{label:e.t("PAGE_ACTION:settings"),icon:"cogs",privileges:["WH:MANAGE","WH:MANAGE:USERS"],href:"#wh/settings?tab="+(i.isAllowedTo("WH:MANAGE")?"":"users")},s]},remoteTopics:{"planning.changes.created":function(e){this.plan.applyChange(e)},"orders.synced":function(){this.promised(this.plan.sapOrders.fetch())},"orders.updated.*":function(t){var s=t.change,i=s.newValues,n=this.plan.sapOrders.get(t._id);if(n){var a=e.clone(i);e.isEmpty(s.comment)||(a.comments=n.get("comments").concat({source:s.source,time:s.time,user:s.user,text:s.comment,delayReason:i.delayReason})),n.set(a)}},"production.stateChanged.**":function(e){this.plan.shiftOrders.update(e)},"old.wh.orders.changed.*":function(e){this.plan.getMoment().isSame(e.date)&&this.promised(this.whOrders.fetch({reset:!0}))},"old.wh.orders.updated":function(e){this.whOrders.update(e.updated||[])},"old.wh.lines.updated":function(e){this.promised(this.whLines.handleUpdate(e))},"old.wh.pickupStatus.updated":function(e){this.pickupStatus.update(e)}},localTopics:{"socket.connected":function(){this.$el.removeClass("wh-is-disconnected"),this.reload()},"socket.disconnected":function(){this.$el.addClass("wh-is-disconnected")}},events:{"click #-message":function(){""===document.getSelection().toString()&&this.hideMessage()},"click #-messageOverlay":function(){this.hideMessage()}},initialize:function(){this.keyBuffer="",this.setToContinue=null,this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){t(document).off("."+this.idPrefix),t(window).off("."+this.idPrefix),w.release()},setUpLayout:function(e){this.layout=e},defineModels:function(){var e=this.model=this.plan=new c({_id:this.options.date},{displayOptions:u.fromLocalStorage({whStatuses:this.options.whStatuses,psStatuses:this.options.psStatuses,distStatuses:this.options.distStatuses,from:this.options.from,to:this.options.to},{storageKey:"PLANNING:DISPLAY_OPTIONS:WH"}),settings:p.fromDate(this.options.date),minMaxDates:!0,pceTimes:!1});this.whSettings=d(w.acquire(),this),this.whOrders=d(new m(null,{date:e.id}),this),this.whLines=e.whLines=d(new g,this),this.pickupStatus=d(new v,this);var t="MSG:LOADING_FAILURE:";d(e,this,t+"plan","planning"),d(e.settings,this,t+"settings","planning"),d(e.sapOrders,this,t+"sapOrders","planning"),d(e.shiftOrders,this,t+"shiftOrders","planning"),window.plan=e},defineViews:function(){this.vkbView=l.isEnabled()?new f:null,this.filterView=new k({plan:this.plan}),this.listView=new y({whSettings:this.whSettings,whLines:this.whLines,whOrders:this.whOrders,plan:this.plan}),this.statusView=new b({model:this.pickupStatus,whSettings:this.whSettings,whOrders:this.whOrders,whLines:this.whLines}),l.isEnabled()&&this.setView("#-vkb",this.vkbView),this.setView("#-filter",this.filterView),this.setView("#-list",this.listView),this.setView("#-status",this.statusView)},defineBindings:function(){var e=this,s=e.plan;e.listenTo(s,"sync",e.onPlanSynced),e.listenTo(s,"change:_id",e.onDateFilterChanged),e.listenTo(s,"change:loading",e.onLoadingChanged),e.listenTo(s.displayOptions,"change:whStatuses",e.onWhStatusesFilterChanged),e.listenTo(s.displayOptions,"change:psStatuses",e.onPsStatusesFilterChanged),e.listenTo(s.displayOptions,"change:distStatuses",e.onDistStatusesFilterChanged),e.listenTo(s.displayOptions,"change:from change:to",e.onStartTimeFilterChanged),e.listenTo(s.displayOptions,"change:useDarkerTheme",e.onDarkerThemeChanged),e.listenTo(s.sapOrders,"sync",e.onSapOrdersSynced),e.listenTo(e.listView,"setClicked",e.onSetClicked),t(document).on("click."+e.idPrefix,".paintShop-breadcrumb",e.onBreadcrumbsClick.bind(e)),t(window).on("keydown."+e.idPrefix,e.onWindowKeyDown.bind(e)).on("keypress."+e.idPrefix,e.onWindowKeyPress.bind(e));var i=e.options.focus;i&&e.listenToOnce(e,"afterRender",function(){var t="set"===i.type?"focusSet":"focusOrder";e.timers.focus=setTimeout(e[t].bind(e,e.options.focus.order,!0),1)}),e.listenToOnce(e,"afterRender",function(){window.parent.postMessage({type:"ready",app:window.WMES_APP_ID},"*")})},load:function(e){var t=this.plan;return e(this.whSettings.fetchIfEmpty(),this.whLines.fetch({reset:!0}),this.whOrders.fetch({reset:!0}),this.pickupStatus.fetch(),t.settings.fetch(),t.shiftOrders.fetch({reset:!0}),t.sapOrders.fetch({reset:!0}),t.fetch())},reload:function(){var e=this,s=e.plan;function i(){s.set("loading",!1)}function a(){s.set("loading",!1),n.msg.loadingFailed()}s.set("loading",!0),e.whOrders.setDateFilter(s.id),s.settings.set("_id",s.id),e.promised(s.settings.fetch()).then(function(){var n=t.when(e.whSettings.fetch({reset:!0}),e.whLines.fetch(),e.whOrders.fetch({reset:!0,reload:!0}),e.pickupStatus.fetch(),s.shiftOrders.fetch({reset:!0,reload:!0}),s.sapOrders.fetch({reset:!0,reload:!0}),s.fetch());e.promised(n).then(i,a)},a)},getTemplateData:function(){return{darker:this.plan.displayOptions.isDarkerThemeUsed()}},afterRender:function(){w.acquire(),l.render(this),this.updateUrl()},updateUrl:function(){var e=this.plan;l.isEnabled()||window.location.pathname.startsWith("/wh-pickup")?sessionStorage.WMES_WH_PICKUP_DATE=e.id:this.broker.publish("router.navigate",{url:"/wh/pickup/"+e.id+"?from="+encodeURIComponent(e.displayOptions.get("from"))+"&to="+encodeURIComponent(e.displayOptions.get("to"))+"&whStatuses="+e.displayOptions.get("whStatuses")+"&psStatuses="+e.displayOptions.get("psStatuses")+"&distStatuses="+e.displayOptions.get("distStatuses"),replace:!0,trigger:!1})},reloadOrders:function(){this.promised(this.plan.sapOrders.fetch({reset:!0}))},toggleLegend:function(e){if(this.$legendPopover)return this.$legendPopover.popover("destroy"),void(this.$legendPopover=null);this.$legendPopover=t(e).popover({trigger:"manual",placement:"left",html:!0,content:A({}),template:'<div class="popover planning-legend-popover"><div class="popover-content"></div></div>'}),this.$legendPopover.one("hide.bs.popover",function(){e.classList.remove("active")}),this.$legendPopover.popover("show"),e.classList.add("active")},onBreadcrumbsClick:function(e){if("A"===e.target.tagName)return!e.target.classList.contains("disabled")&&("showPicker"===e.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(e.target.dataset.action),!1)},onWindowKeyDown:function(e){"Escape"===e.key&&this.hideMessage()},onWindowKeyPress:function(e){var t=e.target.tagName;e.keyCode>=48&&e.keyCode<=57&&"INPUT"!==t&&"TEXTAREA"!==t&&(this.keyBuffer+=(e.keyCode-48).toString()),clearTimeout(this.timers.handleKeyBuffer),this.timers.handleKeyBuffer=setTimeout(this.handleKeyBuffer.bind(this),this.keyBuffer.length>3?200:500)},handleKeyBuffer:function(){if(this.keyBuffer.length>=6)this.resolveAction(this.keyBuffer);else if(this.keyBuffer.length<=3){var e=+this.keyBuffer,t=this.whOrders.find(function(t){return t.get("set")===e});t&&this.focusSet(t.id)}this.keyBuffer=""},resolveAction:function(e,t){var s=this;if(!s.acting){"production"!==window.ENV&&M[e]&&(e=M[e]),s.lastPersonnelId=e;var i=n.currentDialog;if(i instanceof L)i.getCard()===e?i.$id("submit").click():i.setCard(e);else{n.closeAllDialogs(),s.acting=!0,s.showMessage("info",0,"resolvingAction",{personnelId:e});var a=s.promised(s.whOrders.act("resolveAction",Object.assign({source:"pickup",personnelId:e},t)));a.fail(function(){var t=a.responseJSON&&a.responseJSON.error||{},i=t.code;"number"==typeof i&&(i=null,t.code=null),a.status?s.t.has("msg:resolveAction:"+a.status)?i="resolveAction:"+a.status:s.t.has("msg:"+i)||(i="genericFailure"):i="connectionFailure",s.showMessage("error",5e3,"text",{text:s.t("msg:"+i,{errorCode:t.code||t.message||"?",personnelId:e})})}),a.done(function(e){s.hideMessage(),s.handleActionResult(e)}),a.always(function(){s.acting=!1})}}},handleActionResult:function(e){switch(e.result){case"newSetStarted":case"assignedToSet":this.whOrders.update(e.orders),this.continueSet(e.user,e.orders[0].date,e.orders[0].set);break;case"continueSet":this.continueSet(e.user,e.date,e.set);break;case"pickDowntimeReason":this.pickDowntimeReason(e.personnelId,e.user,e.startedAt);break;case"ignoredLines":this.handleIgnoredLines(e.ignoredLines,e.unpaintedLines,e.user);break;default:console.warn("Unknown action result: %s",e.result,e)}},continueSet:function(t,s,i,o){if(!a.utc.getMoment(this.whOrders.getDateFilter()).isSame(s))return this.setToContinue=Array.prototype.slice.call(arguments),void this.plan.set("_id",a.utc.format(s,"YYYY-MM-DD"));this.setToContinue&&this.hideMessage(!0),this.setToContinue=null;var r=this.whOrders.filter(function(e){return e.get("set")===i});if(r.length){!1!==o&&this.focusOrder(r[0].id,!1);var d=n.currentDialog;if(!(t&&d&&d instanceof S&&d.model.user&&d.model.user._id===t._id&&d.model.date===s&&d.model.set===i)){n.closeAllDialogs();var l=r[0].get("line"),h=new S({model:{user:t,date:s,set:i,line:l},whOrders:this.whOrders,plan:this.plan,vkb:this.vkbView});if(r[0].get("redirLine")){var c=r[0].get("lines");l='<span title="'+r[0].get("redirLines").map(function(t,s){return e.escape(t)+" ➜ "+e.escape(c[s]._id)}).join("\n")+'"><i class="fa fa-arrow-right"></i><span>'+e.escape(l)+"</span></span>"}var p=this.t("set:title",{set:i,line:l});t&&(p+=' <span class="wh-set-user"><i class="fa fa-user"></i><span>'+e.escape(t.label)+'</span><i class="fa fa-users"></i><span>'+this.t("func:"+t.func)+"</span></span>"),n.showDialog(h,p)}}},pickDowntimeReason:function(e,t,s){var i=this,a=new O({model:{user:t,startedAt:s}});n.showDialog(a,i.t("downtimePicker:title")),i.listenTo(a,"picked",function(t){i.resolveAction(e,t)})},handleIgnoredLines:function(e,t,s){var i=new D({model:{whLines:this.whLines,ignoredLines:e,unpaintedLines:t,whUser:s}});n.showDialog(i,this.t("blockedPickup:title"))},focusOrder:function(e,s){var i=this.$('tr[data-id="'+e+'"]')[0];if(i&&!i.classList.contains("hidden")){var n=i.getBoundingClientRect().top-this.listView.$("thead").outerHeight();s?t("html, body").stop(!0,!1).animate({scrollTop:n}):window.scrollTo(0,n)}},focusSet:function(t){var s=this.whOrders.get(t);if(s&&s.get("set")){var n=e.find(s.get("funcs"),function(e){return e.user&&e.user.id===i.data._id}),a=n?{_id:i.data._id,label:i.getLabel(),func:n._id}:null;this.continueSet(a,s.get("date"),s.get("set"),!1)}},showMessage:function(e,t,s,i){this.timers.hideMessage&&clearTimeout(this.timers.hideMessage);var n=this.$id("messageOverlay"),a=this.$id("message"),o="block"===n[0].style.display,r=s;P[s]&&(r=this.renderPartialHtml(P[s],i||{})),a.stop(!0,!0),n.css("display","block"),a.html(r).removeClass("message-error message-warning message-success message-info").addClass("message-"+e),o?a.css({marginTop:a.outerHeight()/2*-1+"px",marginLeft:a.outerWidth()/2*-1+"px"}):(a.css({display:"block",marginLeft:"-5000px"}),a.css({display:"none",marginTop:a.outerHeight()/2*-1+"px",marginLeft:a.outerWidth()/2*-1+"px"}),a.fadeIn()),t>0&&(this.timers.hideMessage=setTimeout(this.hideMessage.bind(this),t))},hideMessage:function(e){var t=this;clearTimeout(t.timers.hideMessage);var s=t.$id("messageOverlay");if(s.length&&"none"!==s[0].style.display){var i=t.$id("message");!0===e?n():i.fadeOut(n)}function n(){s.css("display","none"),i.css("display","none"),t.timers&&(t.timers.hideMessage=null)}},showDatePickerDialog:function(){var e=new h({model:{date:this.plan.id}});this.listenTo(e,"picked",function(e){n.closeDialog(),e!==this.plan.id&&this.plan.set("_id",e)}),n.showDialog(e)},selectNonEmptyDate:function(e){t(".paintShop-breadcrumb").find("a").addClass("disabled");var i=this,o=+i.plan.getMoment().valueOf(),r="/old/wh/orders?limit(1)&select(date)";r+="prev"===e?"&sort(-date)&date<"+o+"&date>"+(o-2592e6):"&sort(date)&date>"+o+"&date<"+(o+2592e6);var d=i.ajax({url:r});d.done(function(e){e.totalCount?i.plan.set("_id",a.utc.format(e.collection[0].date,"YYYY-MM-DD")):n.msg.show({type:"warning",time:2500,text:s("paintShop","MSG:date:empty")})}),d.fail(function(){n.msg.show({type:"error",time:2500,text:s("paintShop","MSG:date:failure")})}),d.always(function(){i.layout&&i.layout.setBreadcrumbs(i.breadcrumbs,i)})},onDateFilterChanged:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this)),this.plan.mrps.reset([]),this.plan.sapOrders.reset([]),this.plan.shiftOrders.reset([]),this.plan.orders.reset([]),this.plan.lines.reset([]),this.whOrders.reset([]),this.updateUrl(),this.reload()},onWhStatusesFilterChanged:function(){this.updateUrl()},onPsStatusesFilterChanged:function(){this.updateUrl()},onDistStatusesFilterChanged:function(){this.updateUrl()},onStartTimeFilterChanged:function(){this.updateUrl()},onDarkerThemeChanged:function(){this.$el.toggleClass("planning-darker",this.plan.displayOptions.isDarkerThemeUsed())},onPlanSynced:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this))},onLoadingChanged:function(){this.setToContinue&&(this.plan.get("loading")?this.showMessage("warning",0,"switchingPlan",{newDate:this.plan.getLabel()}):this.continueSet.apply(this,this.setToContinue))},onSapOrdersSynced:function(){this.timers.reloadOrders&&clearTimeout(this.timers.reloadOrders),this.timers.reloadOrders=setTimeout(this.reloadOrders.bind(this),6e5)},onSetClicked:function(e){this.focusSet(e)},showForceLineDialog:function(){var e=this,t=new L({model:{personnelId:e.lastPersonnelId||i.data.cardUid,whLines:e.whLines}});e.listenTo(t,"picked",function(t){n.closeAllDialogs(),e.broker.subscribe("viewport.dialog.hidden").setLimit(1).on("message",function(){console.log("currentDialog",n.currentDialog),e.resolveAction(t.card,{forceLine:t.line})})}),n.showDialog(t,e.t("pickup:forceLine:title"))}})});