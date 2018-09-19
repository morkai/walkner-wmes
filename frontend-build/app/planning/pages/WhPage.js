// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/viewport","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/delayReasons/DelayReasonCollection","app/factoryLayout/productionState","app/paintShop/views/PaintShopDatePickerView","../settings","../Plan","../PlanSettings","../PlanDisplayOptions","../WhOrderStatusCollection","../views/WhFilterView","../views/WhListView","app/planning/templates/whPage","app/planning/templates/planLegend"],function(e,t,s,n,i,a,r,o,l,d,p,h,c,u,g,f,m,w,y,O){"use strict";var v=!1;return r.extend({template:y,layoutName:"page",breadcrumbs:function(){return[{label:s.bound("planning","BREADCRUMBS:wh")},{href:"#planning/wh/"+this.plan.id,label:this.plan.getLabel(),template:function(e){return'<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+e.href+'" data-action="showPicker">'+e.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}}]},actions:function(){var e=this;return[{label:e.t("PAGE_ACTION:dailyPlan"),icon:"calculator",privileges:"PLANNING:VIEW",href:"#planning/plans/"+e.plan.id},{label:e.t("PAGE_ACTION:settings"),icon:"cogs",privileges:"PLANNING:MANAGE",href:"#planning/settings?tab=wh"},{label:e.t("PAGE_ACTION:legend"),icon:"question-circle",callback:function(){return e.toggleLegend(this.querySelector(".btn")),!1}}]},remoteTopics:{"planning.changes.created":function(e){this.plan.applyChange(e)},"orders.synced":function(){this.reloadOrders()},"orders.updated.*":function(t){var s=t.change,n=s.newValues,i=this.plan.sapOrders.get(t._id);if(i){var a=e.clone(n);e.isEmpty(s.comment)||(a.comments=i.get("comments").concat({source:s.source,time:s.time,user:s.user,text:s.comment,delayReason:n.delayReason})),i.set(a)}},"production.stateChanged.**":function(e){this.plan.shiftOrders.update(e)},"paintShop.orders.updated.*":function(e){var t=this.plan.sapOrders.get(e.order);t&&e.status&&t.set("psStatus",e.status)},"planning.whOrderStatuses.updated":function(e){this.whOrderStatuses.update(e)}},localTopics:{"socket.disconnected":function(){v=!0}},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){t(document).off("."+this.idPrefix),t(window).off("."+this.idPrefix),d.unload(),h.release()},setUpLayout:function(e){this.layout=e},defineModels:function(){var e=this,t=e.model=e.plan=new c({_id:e.options.date},{displayOptions:g.fromLocalStorage({mrps:e.options.mrps,lines:e.options.lines},{storageKey:"PLANNING:DISPLAY_OPTIONS:WH"}),settings:u.fromDate(e.options.date),minMaxDates:!0,pceTimes:!1});e.delayReasons=new l,e.whOrderStatuses=o(new f(null,{date:t.id}),e);var s="MSG:LOADING_FAILURE:";o(t,e,s+"plan","planning"),o(t.settings,e,s+"settings","planning"),o(t.sapOrders,e,s+"sapOrders","planning"),o(t.shiftOrders,e,s+"shiftOrders","planning"),o(e.delayReasons,e,s+"delayReasons","planning"),o(d,e,s+"productionState","planning"),window.plan=t},defineViews:function(){this.filterView=new m({plan:this.plan}),this.listView=new w({delayReasons:this.delayReasons,prodLineStates:d.prodLineStates,whOrderStatuses:this.whOrderStatuses,plan:this.plan}),this.setView("#-filter",this.filterView),this.setView("#-list",this.listView)},defineBindings:function(){var e=this,s=e.plan;e.listenTo(s,"sync",e.onPlanSynced),e.listenTo(s,"change:_id",e.onDateFilterChanged),e.listenTo(s.displayOptions,"change:mrps",e.onMrpsFilterChanged),e.listenTo(s.displayOptions,"change:lines",e.onLinesFilterChanged),e.listenTo(s.displayOptions,"change:useDarkerTheme",e.onDarkerThemeChanged),e.listenTo(s.settings,"changed",e.onSettingsChanged),e.listenTo(s.settings,"errored",e.reload),e.listenTo(s.settings.global,"change",e.onGlobalSettingChanged),e.listenTo(s.mrps,"reset",e.onMrpsReset),e.listenTo(s.sapOrders,"sync",e.onSapOrdersSynced),e.listenTo(e.listView,"statsRecounted",e.filterView.updateStats.bind(e.filterView)),e.listenTo(e.whOrderStatuses,"add",e.onWhOrderStatusAdded),e.listenTo(e.whOrderStatuses,"change:status",e.onWhOrderStatusChanged),t(document).on("click."+e.idPrefix,".paintShop-breadcrumb",this.onBreadcrumbsClick.bind(this))},load:function(e){var t=this.plan,s=v;return v=!1,e(d.load(s),this.delayReasons.fetch({reset:!0}),this.whOrderStatuses.fetch({reset:!0}),t.settings.fetch(),t.shiftOrders.fetch({reset:!0}),t.sapOrders.fetch({reset:!0}),t.fetch())},serialize:function(){return{idPrefix:this.idPrefix,darker:this.plan.displayOptions.isDarkerThemeUsed()}},afterRender:function(){d.load(!1),h.acquire()},reload:function(){function e(){i.set("loading",!1),n.msg.loadingFailed()}var s=this,i=s.plan;i.set("loading",!0),s.whOrderStatuses.date=i.id,s.promised(i.settings.set("_id",i.id).fetch()).then(function(){var n=t.when(s.whOrderStatuses.fetch({reset:!0}),i.shiftOrders.fetch({reset:!0,reload:!0}),i.sapOrders.fetch({reset:!0,reload:!0}),i.fetch());s.promised(n).then(i.set.bind(i,"loading",!1),e)},e)},updateUrl:function(){var e=this.plan;this.broker.publish("router.navigate",{url:"/planning/wh/"+e.id+"?mrps="+e.displayOptions.get("mrps")+"&lines="+e.displayOptions.get("lines"),replace:!0,trigger:!1})},reloadOrders:function(){this.promised(this.plan.sapOrders.fetch({reset:!0}))},toggleLegend:function(e){if(this.$legendPopover)return this.$legendPopover.popover("destroy"),void(this.$legendPopover=null);this.$legendPopover=t(e).popover({trigger:"manual",placement:"left",html:!0,content:O({}),template:'<div class="popover planning-legend-popover"><div class="popover-content"></div></div>'}),this.$legendPopover.one("hide.bs.popover",function(){e.classList.remove("active")}),this.$legendPopover.popover("show"),e.classList.add("active")},onBreadcrumbsClick:function(e){if("A"===e.target.tagName)return!e.target.classList.contains("disabled")&&("showPicker"===e.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(e.target.dataset.action),!1)},showDatePickerDialog:function(){var e=new p({model:{date:this.plan.id}});this.listenTo(e,"picked",function(e){n.closeDialog(),e!==this.plan.id&&this.plan.set("_id",e)}),n.showDialog(e)},selectNonEmptyDate:function(e){t(".paintShop-breadcrumb").find("a").addClass("disabled");var a=this,r=+a.plan.getMoment().valueOf(),o="/planning/plans/?limit(1)&select(_id)&orders>()";o+="prev"===e?"&sort(-_id)&_id<"+r+"&_id>"+(r-2592e6):"&sort(_id)&_id>"+r+"&_id<"+(r+2592e6);var l=a.ajax({url:o});l.done(function(e){e.totalCount?a.plan.set("_id",i.utc.format(e.collection[0]._id,"YYYY-MM-DD")):n.msg.show({type:"warning",time:2500,text:s("paintShop","MSG:date:empty")})}),l.fail(function(){n.msg.show({type:"error",time:2500,text:s("paintShop","MSG:date:failure")})}),l.always(function(){a.layout&&a.layout.setBreadcrumbs(a.breadcrumbs,a)})},onDateFilterChanged:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this)),this.updateUrl(),this.plan.mrps.reset([]),this.plan.sapOrders.reset([]),this.plan.shiftOrders.reset([]),this.plan.orders.reset([]),this.plan.lines.reset([]),this.reload()},onMrpsFilterChanged:function(){this.updateUrl(),this.plan.mrps.reset()},onLinesFilterChanged:function(){this.updateUrl(),this.listView.scheduleRender()},onDarkerThemeChanged:function(){this.$el.toggleClass("planning-darker",this.plan.displayOptions.isDarkerThemeUsed())},onPlanSynced:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this))},onSettingsChanged:function(e){e.reset&&this.plan.mrps.reset()},onGlobalSettingChanged:function(t){if(/ignoredMrps/.test(t.id))return void("wh"===e.first(this.plan.displayOptions.get("mrps"))&&this.plan.mrps.reset());/.wh./.test(t.id)&&this.listView.scheduleRender()},onSapOrdersSynced:function(){this.timers.reloadOrders&&clearTimeout(this.timers.reloadOrders),this.timers.reloadOrders=setTimeout(this.reloadOrders.bind(this),6e5)},onMrpsReset:function(){this.listView.scheduleRender()},onWhOrderStatusAdded:function(e){this.filterView.updateStat(0,e.get("status"))},onWhOrderStatusChanged:function(e){var t=e.previous("status");"number"==typeof t&&this.filterView.updateStat(t,e.get("status"))}})});