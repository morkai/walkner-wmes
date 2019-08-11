define(["underscore","jquery","app/i18n","app/user","app/viewport","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/core/util/embedded","app/paintShop/views/PaintShopDatePickerView","app/planning/Plan","app/planning/PlanSettings","app/planning/PlanDisplayOptions","../settings","../WhOrderCollection","../views/WhFilterView","../views/WhPlanView","../views/WhSetView","../templates/messages","app/wh/templates/planPage","app/wh/templates/resolveAction","app/planning/templates/planLegend"],function(e,t,s,i,n,a,r,o,l,d,h,c,p,u,f,g,m,w,v,y,O,S,b){"use strict";var T=window.parent!==window||"/"!==window.location.pathname;return o.extend({template:O,layoutName:"page",breadcrumbs:function(){return[{label:s.bound("wh","BREADCRUMBS:base")},{href:"#wh/plans/"+this.plan.id,label:this.plan.getLabel(),template:function(e){return'<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+e.href+'" data-action="showPicker">'+e.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}},{label:s.bound("wh","BREADCRUMBS:pickup")}]},actions:function(){var e=this,t={label:e.t("PAGE_ACTION:legend"),icon:"question-circle",callback:function(){return e.toggleLegend(this.querySelector(".btn")),!1}};return T?[{label:s("wh","PAGE_ACTION:problems"),icon:"bug",privileges:"WH:VIEW",href:"/wh-problems"},t]:[{template:function(){return S({})},afterRender:function(t){t.find("form").on("submit",function(){return e.resolveAction(t.find('input[name="card"]').val()),!1})}},{label:e.t("PAGE_ACTION:wh:old"),icon:"truck",privileges:"WH:VIEW",href:"#planning/wh/"+e.plan.id},{label:s("wh","PAGE_ACTION:problems"),icon:"bug",privileges:"WH:VIEW",href:"#wh/problems"},{label:e.t("PAGE_ACTION:dailyPlan"),icon:"calculator",privileges:"PLANNING:VIEW",href:"#planning/plans/"+e.plan.id},{label:e.t("PAGE_ACTION:settings"),icon:"cogs",privileges:["WH:MANAGE","WH:MANAGE:USERS"],href:"#wh/settings?tab="+(i.isAllowedTo("WH:MANAGE")?"":"users")},t]},remoteTopics:{"planning.changes.created":function(e){this.plan.applyChange(e)},"orders.updated.*":function(t){var s=t.change,i=s.newValues,n=this.plan.sapOrders.get(t._id);if(n){var a=e.clone(i);e.isEmpty(s.comment)||(a.comments=n.get("comments").concat({source:s.source,time:s.time,user:s.user,text:s.comment,delayReason:i.delayReason})),n.set(a)}},"production.stateChanged.**":function(e){this.plan.shiftOrders.update(e)},"wh.orders.changed.*":function(e){this.plan.getMoment().isSame(e.date)&&this.promised(this.whOrders.fetch({reset:!0}))},"wh.orders.updated":function(e){var t=e.orders;t.length&&this.whOrders.get(t[0]._id)&&this.whOrders.update(t)}},localTopics:{"socket.connected":function(){this.$el.removeClass("wh-is-disconnected"),this.reload()},"socket.disconnected":function(){this.$el.addClass("wh-is-disconnected")}},events:{"click #-message":function(){""===document.getSelection().toString()&&this.hideMessage()},"click #-messageOverlay":function(){this.hideMessage()}},initialize:function(){this.keyBuffer="",this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){t(document).off("."+this.idPrefix),t(window).off("."+this.idPrefix),f.release()},setUpLayout:function(e){this.layout=e},defineModels:function(){var e=this.model=this.plan=new c({_id:this.options.date},{displayOptions:u.fromLocalStorage({whStatuses:this.options.whStatuses,psStatuses:this.options.psStatuses,from:this.options.from,to:this.options.to},{storageKey:"PLANNING:DISPLAY_OPTIONS:WH"}),settings:p.fromDate(this.options.date),minMaxDates:!0,pceTimes:!1});this.whSettings=l(f.acquire(),this),this.whOrders=l(new g(null,{date:e.id}),this);var t="MSG:LOADING_FAILURE:";l(e,this,t+"plan","planning"),l(e.settings,this,t+"settings","planning"),l(e.sapOrders,this,t+"sapOrders","planning"),l(e.shiftOrders,this,t+"shiftOrders","planning"),window.plan=e},defineViews:function(){this.filterView=new m({plan:this.plan}),this.listView=new w({whSettings:this.whSettings,whOrders:this.whOrders,plan:this.plan}),this.setView("#-filter",this.filterView),this.setView("#-list",this.listView)},defineBindings:function(){var e=this,s=e.plan;e.listenTo(s,"sync",e.onPlanSynced),e.listenTo(s,"change:_id",e.onDateFilterChanged),e.listenTo(s.displayOptions,"change:whStatuses",e.onWhStatusesFilterChanged),e.listenTo(s.displayOptions,"change:psStatuses",e.onPsStatusesFilterChanged),e.listenTo(s.displayOptions,"change:from change:to",e.onStartTimeFilterChanged),e.listenTo(s.displayOptions,"change:useDarkerTheme",e.onDarkerThemeChanged),e.listenTo(s.sapOrders,"sync",e.onSapOrdersSynced),e.listenTo(e.listView,"setClicked",e.onSetClicked),t(document).on("click."+e.idPrefix,".paintShop-breadcrumb",e.onBreadcrumbsClick.bind(e)),t(window).on("keydown."+e.idPrefix,e.onWindowKeyDown.bind(e)).on("keypress."+e.idPrefix,e.onWindowKeyPress.bind(e)),e.options.focus&&e.listenToOnce(e,"afterRender",function(){e.timers.focus=setTimeout(e.focusOrder.bind(e,e.options.focus,!0),1)}),e.listenToOnce(e,"afterRender",function(){window.parent.postMessage({type:"ready",app:window.WMES_APP_ID},"*")})},load:function(e){var t=this.plan;return e(this.whSettings.fetchIfEmpty(),this.whOrders.fetch({reset:!0}),t.settings.fetch(),t.shiftOrders.fetch({reset:!0}),t.sapOrders.fetch({reset:!0}),t.fetch())},getTemplateData:function(){return{darker:this.plan.displayOptions.isDarkerThemeUsed()}},afterRender:function(){f.acquire(),d.render(this),this.updateUrl()},reload:function(){var e=this,s=e.plan;function i(){s.set("loading",!1),n.msg.loadingFailed()}s.set("loading",!0),e.whOrders.date=e.plan.id,e.promised(s.settings.set("_id",s.id).fetch()).then(function(){var n=t.when(e.whSettings.fetch({reset:!0}),e.whOrders.fetch({reset:!0,reload:!0}),s.shiftOrders.fetch({reset:!0,reload:!0}),s.sapOrders.fetch({reset:!0,reload:!0}),s.fetch());e.promised(n).then(s.set.bind(s,"loading",!1),i)},i)},updateUrl:function(){var e=this.plan;T?sessionStorage.WMES_WH_PICKUP_DATE=e.id:this.broker.publish("router.navigate",{url:"/wh/plans/"+e.id+"?from="+encodeURIComponent(e.displayOptions.get("from"))+"&to="+encodeURIComponent(e.displayOptions.get("to"))+"&whStatuses="+e.displayOptions.get("whStatuses")+"&psStatuses="+e.displayOptions.get("psStatuses"),replace:!0,trigger:!1})},reloadOrders:function(){this.promised(this.plan.sapOrders.fetch({reset:!0}))},toggleLegend:function(e){if(this.$legendPopover)return this.$legendPopover.popover("destroy"),void(this.$legendPopover=null);this.$legendPopover=t(e).popover({trigger:"manual",placement:"left",html:!0,content:b({}),template:'<div class="popover planning-legend-popover"><div class="popover-content"></div></div>'}),this.$legendPopover.one("hide.bs.popover",function(){e.classList.remove("active")}),this.$legendPopover.popover("show"),e.classList.add("active")},onBreadcrumbsClick:function(e){if("A"===e.target.tagName)return!e.target.classList.contains("disabled")&&("showPicker"===e.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(e.target.dataset.action),!1)},onWindowKeyDown:function(e){"Escape"===e.key&&this.hideMessage()},onWindowKeyPress:function(e){var t=e.target.tagName;e.keyCode>=48&&e.keyCode<=57&&"INPUT"!==t&&"TEXTAREA"!==t&&(this.keyBuffer+=(e.keyCode-48).toString()),clearTimeout(this.timers.handleKeyBuffer),this.timers.handleKeyBuffer=setTimeout(this.handleKeyBuffer.bind(this),200)},handleKeyBuffer:function(){this.keyBuffer.length>=6&&this.resolveAction(this.keyBuffer),this.keyBuffer=""},resolveAction:function(e){var t=this;if(!t.acting){t.acting=!0,t.showMessage("info",0,"resolvingAction",{personnelId:e});var i=t.promised(t.whOrders.act("resolveAction",{personnelId:e}));i.fail(function(){var n=i.responseJSON&&i.responseJSON.error&&i.responseJSON.error.code,a=n;i.status?s.has("wh","msg:resolveAction:"+i.status)?a="resolveAction:"+i.status:s.has("wh","msg:"+a)||(a="genericFailure"):a="connectionFailure",t.showMessage("error",5e3,"text",{text:s("wh","msg:"+a,{errorCode:n,personnelId:e})})}),i.done(function(e){t.hideMessage(),t.handleActionResult(e)}),i.always(function(){t.acting=!1})}},handleActionResult:function(e){switch(e.result){case"newSetStarted":case"assignedToSet":this.whOrders.update(e.orders),this.continueSet(e.user,e.orders[0].set);break;case"continueSet":this.continueSet(e.user,e.set)}},continueSet:function(e,t,i){var a=this.whOrders.filter(function(e){return e.get("set")===t});if(a.length){!1!==i&&this.focusOrder(a[0].id,!1);var r=n.currentDialog;if(!(r&&e&&r instanceof v&&r.model.user&&r.model.user._id===e._id&&r.model.set===t)){n.closeAllDialogs();var o=new v({model:{user:e,set:t},whOrders:this.whOrders,plan:this.plan});n.showDialog(o,s("wh","set:title",{set:t,line:a[0].get("line")}))}}},focusOrder:function(e,s){var i=this.$('tr[data-id="'+e+'"]')[0];if(i&&!i.classList.contains("hidden")){var n=i.getBoundingClientRect().top-this.listView.$("thead").outerHeight();s?t("html, body").stop(!0,!1).animate({scrollTop:n}):window.scrollTo(0,n)}},showMessage:function(e,t,s,i){this.timers.hideMessage&&clearTimeout(this.timers.hideMessage);var n=this.$id("messageOverlay"),a=this.$id("message"),r="block"===n[0].style.display;n.css("display","block"),a.html(y[s]&&y[s](i||{})||s).removeClass("message-error message-warning message-success message-info").addClass("message-"+e),r?a.css({marginTop:a.outerHeight()/2*-1+"px",marginLeft:a.outerWidth()/2*-1+"px"}):(a.css({display:"block",marginLeft:"-5000px"}),a.css({display:"none",marginTop:a.outerHeight()/2*-1+"px",marginLeft:a.outerWidth()/2*-1+"px"}),a.fadeIn()),t>0&&(this.timers.hideMessage=setTimeout(this.hideMessage.bind(this),t))},hideMessage:function(){var e=this;clearTimeout(e.timers.hideMessage);var t=e.$id("messageOverlay");if("none"!==t[0].style.display){var s=e.$id("message");s.fadeOut(function(){t.css("display","none"),s.css("display","none"),e.timers&&(e.timers.hideMessage=null)})}},showDatePickerDialog:function(){var e=new h({model:{date:this.plan.id}});this.listenTo(e,"picked",function(e){n.closeDialog(),e!==this.plan.id&&this.plan.set("_id",e)}),n.showDialog(e)},selectNonEmptyDate:function(e){t(".paintShop-breadcrumb").find("a").addClass("disabled");var i=this,r=+i.plan.getMoment().valueOf(),o="/wh/orders?limit(1)&select(date)";o+="prev"===e?"&sort(-date)&date<"+r+"&date>"+(r-2592e6):"&sort(date)&date>"+r+"&date<"+(r+2592e6);var l=i.ajax({url:o});l.done(function(e){e.totalCount?i.plan.set("_id",a.utc.format(e.collection[0].date,"YYYY-MM-DD")):n.msg.show({type:"warning",time:2500,text:s("paintShop","MSG:date:empty")})}),l.fail(function(){n.msg.show({type:"error",time:2500,text:s("paintShop","MSG:date:failure")})}),l.always(function(){i.layout&&i.layout.setBreadcrumbs(i.breadcrumbs,i)})},onDateFilterChanged:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this)),this.plan.mrps.reset([]),this.plan.sapOrders.reset([]),this.plan.shiftOrders.reset([]),this.plan.orders.reset([]),this.plan.lines.reset([]),this.whOrders.reset([]),this.updateUrl(),this.reload()},onWhStatusesFilterChanged:function(){this.updateUrl()},onPsStatusesFilterChanged:function(){this.updateUrl()},onStartTimeFilterChanged:function(){this.updateUrl()},onDarkerThemeChanged:function(){this.$el.toggleClass("planning-darker",this.plan.displayOptions.isDarkerThemeUsed())},onPlanSynced:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this))},onSapOrdersSynced:function(){this.timers.reloadOrders&&clearTimeout(this.timers.reloadOrders),this.timers.reloadOrders=setTimeout(this.reloadOrders.bind(this),6e5)},onSetClicked:function(t){var s=this.whOrders.get(t);if(s&&s.get("set")){var n=e.find(s.get("funcs"),function(e){return e.user&&e.user.id===i.data._id}),a=n?{_id:i.data._id,label:i.getLabel(),func:n._id}:null;this.continueSet(a,s.get("set"),!1)}}})});