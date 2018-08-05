// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/viewport","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/delayReasons/DelayReasonCollection","app/factoryLayout/productionState","app/paintShop/views/PaintShopDatePickerView","../Plan","../PlanSettings","../PlanDisplayOptions","../views/PlanFilterView","../views/PlanMrpView","app/planning/templates/planPage","app/planning/templates/planLegend"],function(e,t,n,i,s,a,r,o,l,d,p,c,h,g,u,f,m,y){"use strict";var b=!1;return r.extend({template:m,layoutName:"page",breadcrumbs:function(){return[{href:"#planning/plans",label:n.bound("planning","BREADCRUMBS:base")},{href:"#planning/plans/"+this.plan.id,label:this.plan.getLabel(),template:function(e){return'<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+e.href+'" data-action="showPicker">'+e.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}}]},actions:function(){var e=this,t=s.getMoment(e.plan.id,"YYYY-MM-DD").hours(6);return[{label:n.bound("planning","PAGE_ACTION:hourlyPlans"),icon:"calendar",privileges:"HOURLY_PLANS:VIEW",href:"#hourlyPlans?sort(-date)&limit(20)&date=ge="+t.valueOf()+"&date=lt="+t.add(1,"days").valueOf()},{label:n.bound("planning","PAGE_ACTION:paintShop"),icon:"paint-brush",privileges:"PAINT_SHOP:VIEW",href:"#paintShop/"+e.plan.id},{label:n.bound("planning","PAGE_ACTION:wh"),icon:"truck",privileges:"PLANNING:VIEW",href:"#planning/wh/"+e.plan.id},{label:n.bound("planning","PAGE_ACTION:changes"),icon:"list-ol",href:"#planning/changes?sort(date)&plan="+e.plan.id},{label:n.bound("planning","PAGE_ACTION:settings"),icon:"cogs",privileges:"PLANNING:MANAGE",href:"#planning/settings/"+e.plan.id,className:e.plan.isEditable()?"":"disabled",callback:function(t){if(0===t.button&&!t.ctrlKey&&e.plan.isEditable())return e.broker.publish("router.navigate",{url:"/planning/settings/"+e.plan.id+"?back=1",trigger:!0,replace:!1}),!1}},{label:n.bound("planning","PAGE_ACTION:legend"),icon:"question-circle",callback:function(){return e.toggleLegend(this.querySelector(".btn")),!1}}]},remoteTopics:{"planning.changes.created":function(e){this.plan.applyChange(e)},"planning.generator.started":function(e){e.date===this.plan.id&&(this.$msg=i.msg.show({type:"info",text:n("planning","MSG:GENERATING")}))},"planning.generator.finished":function(e){var t=this.$msg;t&&e.date===this.plan.id&&(i.msg.hide(t),this.$msg=null)},"orders.synced":function(){this.reloadOrders()},"orders.updated.*":function(t){var n=this.plan.lateOrders.get(t._id),i=t.change,s=i.newValues;n&&void 0!==s.delayReason&&n.set("delayReason",s.delayReason);var a=this.plan.sapOrders.get(t._id);if(a){var r=e.clone(s);e.isEmpty(i.comment)||(r.comments=a.get("comments").concat({source:i.source,time:i.time,user:i.user,text:i.comment,delayReason:s.delayReason})),a.set(r)}},shiftChanged:function(e){this.plan.set("active",s.format(e.date,"YYYY-MM-DD")===this.plan.id)},"production.stateChanged.**":function(e){this.plan.shiftOrders.update(e)},"paintShop.orders.updated.*":function(e){var t=this.plan.sapOrders.get(e.order);t&&e.status&&t.set("psStatus",e.status)}},localTopics:{"socket.disconnected":function(){b=!0},"planning.mrpStatsRecounted":"scheduleStatRecount"},events:{"click #-mrpSelector":"hideMrpSelector","click #-mrpSelector .btn":function(e){this.scrollToMrp(e.currentTarget.dataset.mrp)}},initialize:function(){this.$msg=null,this.keysPressed=["","",""],this.lastKeyPressAt=0,this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){t(document).off("."+this.idPrefix),t(window).off("."+this.idPrefix),d.unload()},setUpLayout:function(e){this.layout=e},defineModels:function(){var e=this,t=e.plan=new c({_id:e.options.date},{displayOptions:g.fromLocalStorage({mrps:e.options.mrps}),settings:h.fromDate(e.options.date),minMaxDates:!0,pceTimes:!1});e.delayReasons=new l;var n="MSG:LOADING_FAILURE:";o(t,e,n+"plan","planning"),o(t.settings,e,n+"settings","planning"),o(t.lateOrders,e,n+"lateOrders","planning"),o(t.sapOrders,e,n+"sapOrders","planning"),o(t.shiftOrders,e,n+"shiftOrders","planning"),o(e.delayReasons,e,n+"delayReasons","planning"),o(d,e,n+"productionState","planning"),window.plan=t},defineViews:function(){this.filterView=new u({plan:this.plan}),this.setView("#-filter",this.filterView)},defineBindings:function(){var n=this,i=n.plan;n.listenTo(i,"sync",n.onPlanSynced),n.listenTo(i,"change:_id",n.onDateFilterChanged),n.listenTo(i.displayOptions,"change:mrps",n.onMrpsFilterChanged),n.listenTo(i.displayOptions,"change:wrapLists",n.onWrapListsChanged),n.listenTo(i.displayOptions,"change:useDarkerTheme",n.onDarkerThemeChanged),n.listenTo(i.displayOptions,"change:useLatestOrderData",n.updateUrl),n.listenTo(i.settings,"changed",n.onSettingsChanged),n.listenTo(i.settings,"errored",n.reload),n.listenTo(i.mrps,"reset",e.after(2,e.debounce(n.renderMrps.bind(n),1))),n.listenTo(i.orders,"added",n.reloadOrders.bind(n,!0)),n.listenTo(i.sapOrders,"sync",n.onSapOrdersSynced),t(document).on("click."+n.idPrefix,".paintShop-breadcrumb",n.onBreadcrumbsClick.bind(n)),t(window).on("resize."+n.idPrefix,e.debounce(n.onWindowResize.bind(n),16)).on("keydown."+n.idPrefix,n.onWindowKeyDown.bind(n)).on("keyup."+n.idPrefix,n.onWindowKeyUp.bind(n))},load:function(e){var n=this,i=n.plan,s=b,a=t.Deferred();b=!1;var r=t.when(n.promised(d.load(s)),n.promised(n.delayReasons.fetch({reset:!0})),n.promised(i.settings.fetch()),n.promised(i.shiftOrders.fetch({reset:!0})),n.promised(i.sapOrders.fetch({reset:!0})),n.promised(i.lateOrders.fetch({reset:!0})));return r.fail(function(){a.reject.apply(a,arguments)}),r.done(function(){var e=n.promised(i.fetch());e.fail(function(){a.reject.apply(a,arguments)}),e.done(function(){a.resolve()})}),e(a.promise())},serialize:function(){return{idPrefix:this.idPrefix,wrap:this.plan.displayOptions.isListWrappingEnabled(),darker:this.plan.displayOptions.isDarkerThemeUsed()}},afterRender:function(){d.load(!1),this.renderMrps()},reload:function(){function e(){s.set("loading",!1),i.msg.loadingFailed()}var n=this,s=n.plan;s.set("loading",!0),n.promised(s.settings.set("_id",s.id).fetch()).then(function(){var i=b;b=!1;var a=t.when(d.load(i),s.shiftOrders.fetch({reset:!0,reload:!0}),s.sapOrders.fetch({reset:!0,reload:!0}),s.lateOrders.fetch({reset:!0,reload:!0}),s.fetch());n.promised(a).then(s.set.bind(s,"loading",!1),e)},e)},updateUrl:function(){var e=this.plan;this.broker.publish("router.navigate",{url:"/planning/plans/"+e.id+"?mrps="+e.displayOptions.get("mrps")+"&sapOrders="+(e.displayOptions.isLatestOrderDataUsed()?1:0),replace:!0,trigger:!1})},renderMrps:function(){var e=this,t=e.plan.isAnythingLoading();e.removeView("#-mrps"),e.plan.mrps.forEach(function(n){var i=new f({delayReasons:e.delayReasons,prodLineStates:d.prodLineStates,plan:e.plan,mrp:n});e.insertView("#-mrps",i),t||i.render()}),this.$id("empty").toggleClass("hidden",e.plan.mrps.length>0),this.$id("mrps").toggleClass("hidden",0===e.plan.mrps.length),clearTimeout(this.timers.recountStats),this.recountStats()},reloadOrders:function(e){e||this.promised(this.plan.lateOrders.fetch({reset:!0})),this.promised(this.plan.sapOrders.fetch({reset:!0}))},scheduleStatRecount:function(){this.timers.recountStats&&clearTimeout(this.timers.recountStats),this.timers.recountStats=setTimeout(this.recountStats.bind(this),10)},recountStats:function(){this.filterView.recountStats()},toggleLegend:function(e){if(this.$legendPopover)return this.$legendPopover.popover("destroy"),void(this.$legendPopover=null);this.$legendPopover=t(e).popover({trigger:"manual",placement:"left",html:!0,content:y({}),template:'<div class="popover planning-legend-popover"><div class="popover-content"></div></div>'}),this.$legendPopover.one("hide.bs.popover",function(){e.classList.remove("active")}),this.$legendPopover.popover("show"),e.classList.add("active")},toggleLineOrdersList:function(){var e=this.$(".planning-mrp"),t=window.scrollY,n=null;if(e.length>1&&t>e[0].offsetTop&&(n=e[e.length-1],t+window.innerHeight<document.scrollingElement.scrollHeight))for(var i=0;i<e.length&&(n=e[i],!(t<n.offsetTop+125));++i);this.plan.displayOptions.toggleLineOrdersList(),n&&window.scrollTo(0,n.offsetTop-(e[0]===n?10:-1))},onBreadcrumbsClick:function(e){if("A"===e.target.tagName)return!e.target.classList.contains("disabled")&&("showPicker"===e.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(e.target.dataset.action),!1)},showDatePickerDialog:function(){var e=new p({model:{date:this.plan.id}});this.listenTo(e,"picked",function(e){i.closeDialog(),e!==this.plan.id&&this.plan.set("_id",e)}),i.showDialog(e)},selectNonEmptyDate:function(e){t(".paintShop-breadcrumb").find("a").addClass("disabled");var a=this,r=+a.plan.getMoment().valueOf(),o="/planning/plans/?limit(1)&select(_id)&orders>()";o+="prev"===e?"&sort(-_id)&_id<"+r+"&_id>"+(r-2592e6):"&sort(_id)&_id>"+r+"&_id<"+(r+2592e6);var l=a.ajax({url:o});l.done(function(e){e.totalCount?a.plan.set("_id",s.utc.format(e.collection[0]._id,"YYYY-MM-DD")):i.msg.show({type:"warning",time:2500,text:n("paintShop","MSG:date:empty")})}),l.fail(function(){i.msg.show({type:"error",time:2500,text:n("paintShop","MSG:date:failure")})}),l.always(function(){a.layout&&a.layout.setBreadcrumbs(a.breadcrumbs,a)})},showMrpSelector:function(){if(1!==this.plan.mrps.length){var e={};this.plan.mrps.forEach(function(t){var n=t.id.substring(0,2);e[n]||(e[n]=[]),e[n].push(t.id)});var t="",n=0;Object.keys(e).sort().forEach(function(i){t+='<div class="planning-mrpSelector-row">',e[i].sort().forEach(function(e){++n;var i=10===n?0:n<10?n:-1;t+='<button type="button" class="btn btn-default btn-lg" data-mrp="'+e+'" data-key="'+i+'">'+e+(i>=0?"<kbd>"+i+"</kbd>":"")+"</button>"}),t+="</div>"}),this.$(".planning-mrpSelector-mrps").html(t),this.$id("mrpSelector").removeClass("hidden")}},hideMrpSelector:function(){this.$id("mrpSelector").addClass("hidden")},scrollToMrp:function(e){var n=this.$('.planning-mrp[data-id="'+e+'"]'),i=n.prop("offsetTop");n.prev().length||(i-=10),t("html, body").animate({scrollTop:i},"fast","swing")},onDateFilterChanged:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this)),this.updateUrl(),this.plan.mrps.reset([]),this.plan.sapOrders.reset([]),this.plan.shiftOrders.reset([]),this.plan.lateOrders.reset([]),this.plan.orders.reset([]),this.plan.lines.reset([]),this.reload()},onMrpsFilterChanged:function(){this.updateUrl(),this.plan.mrps.reset()},onWrapListsChanged:function(){this.$el.toggleClass("wrap",this.plan.displayOptions.isListWrappingEnabled())},onDarkerThemeChanged:function(){this.$el.toggleClass("planning-darker",this.plan.displayOptions.isDarkerThemeUsed())},onPlanSynced:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this))},onSettingsChanged:function(e){e.reset&&this.plan.mrps.reset()},onSapOrdersSynced:function(){this.timers.reloadOrders&&clearTimeout(this.timers.reloadOrders),this.timers.reloadOrders=setTimeout(this.reloadOrders.bind(this),6e5)},onWindowResize:function(e){this.broker.publish("planning.windowResized",e)},onWindowKeyDown:function(e){if(32===e.keyCode&&"INPUT"!==e.target.tagName&&"TEXTAREA"!==e.target.tagName&&"BUTTON"!==e.target.tagName&&"A"!==e.target.tagName)return!1},onWindowKeyUp:function(e){if(27===e.keyCode)this.broker.publish("planning.escapePressed"),this.hideMrpSelector();else if("INPUT"!==e.target.tagName&&"TEXTAREA"!==e.target.tagName&&"BUTTON"!==e.target.tagName&&"A"!==e.target.tagName){var t=!1;if(e.keyCode>=48&&e.keyCode<=90){this.keysPressed.shift(),this.keysPressed.push(e.originalEvent.key);var n=this.keysPressed.join("").toUpperCase();this.plan.mrps.get(n)?(this.scrollToMrp(n),t=!0):t=e.timeStamp-this.lastKeyPressAt<=500}t||79!==e.keyCode&&90!==e.keyCode?32===e.keyCode?this.$id("mrpSelector").hasClass("hidden")?this.showMrpSelector():this.hideMrpSelector():e.keyCode>=48&&e.keyCode<=57&&!this.$id("mrpSelector").hasClass("hidden")&&this.$('.planning-mrpSelector-row > .btn[data-key="'+(e.keyCode-48)+'"]').click():this.toggleLineOrdersList()}this.lastKeyPressAt=e.timeStamp}})});