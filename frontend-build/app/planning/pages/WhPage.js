define(["underscore","jquery","app/i18n","app/viewport","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/delayReasons/DelayReasonCollection","app/factoryLayout/productionState","app/paintShop/views/PaintShopDatePickerView","../settings","../Plan","../PlanSettings","../PlanDisplayOptions","../WhOrderStatusCollection","../views/WhFilterView","../views/WhListView","app/planning/templates/whPage","app/planning/templates/planLegend"],function(t,e,s,i,n,a,r,o,l,d,h,p,c,u,g,f,m,w,S,y){"use strict";var O=!1;return r.extend({template:S,layoutName:"page",breadcrumbs:function(){return[{label:s.bound("planning","BREADCRUMB:wh")},{href:"#planning/wh/"+this.plan.id,label:this.plan.getLabel(),template:function(t){return'<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+t.href+'" data-action="showPicker">'+t.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}}]},actions:function(){var t=this;return[{label:t.t("PAGE_ACTION:wh:new"),icon:"truck",privileges:"WH:VIEW",href:"#wh/plans/"+t.plan.id},{label:t.t("PAGE_ACTION:dailyPlan"),icon:"calculator",privileges:"PLANNING:VIEW",href:"#planning/plans/"+t.plan.id},{label:t.t("PAGE_ACTION:settings"),icon:"cogs",privileges:"PLANNING:MANAGE",href:"#planning/settings?tab=wh"},{label:t.t("PAGE_ACTION:legend"),icon:"question-circle",callback:function(){return t.toggleLegend(this.querySelector(".btn")),!1}}]},remoteTopics:{"planning.changes.created":function(t){this.plan.applyChange(t)},"orders.synced":function(){this.reloadOrders()},"orders.updated.*":function(e){var s=e.change,i=s.newValues,n=this.plan.sapOrders.get(e._id);if(n){var a=t.clone(i);t.isEmpty(s.comment)||(a.comments=n.get("comments").concat({source:s.source,time:s.time,user:s.user,text:s.comment,delayReason:i.delayReason})),n.set(a)}},"production.stateChanged.**":function(t){this.plan.shiftOrders.update(t)},"planning.whOrderStatuses.updated":function(t){this.whOrderStatuses.update(t)}},localTopics:{"socket.disconnected":function(){O=!0}},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){e(document).off("."+this.idPrefix),e(window).off("."+this.idPrefix),d.unload(),p.release()},setUpLayout:function(t){this.layout=t},defineModels:function(){var t=this.model=this.plan=new c({_id:this.options.date},{displayOptions:g.fromLocalStorage({mrps:this.options.mrps,lines:this.options.lines,whStatuses:this.options.whStatuses,psStatuses:this.options.psStatuses,from:this.options.from,to:this.options.to},{storageKey:"PLANNING:DISPLAY_OPTIONS:WH"}),settings:u.fromDate(this.options.date),minMaxDates:!0,pceTimes:!1});this.delayReasons=new l,this.whOrderStatuses=o(new f(null,{date:t.id}),this);var e="MSG:LOADING_FAILURE:";o(t,this,e+"plan","planning"),o(t.settings,this,e+"settings","planning"),o(t.sapOrders,this,e+"sapOrders","planning"),o(t.shiftOrders,this,e+"shiftOrders","planning"),o(this.delayReasons,this,e+"delayReasons","planning"),o(d,this,e+"productionState","planning"),window.plan=t},defineViews:function(){this.filterView=new m({plan:this.plan}),this.listView=new w({delayReasons:this.delayReasons,prodLineStates:d.prodLineStates,whOrderStatuses:this.whOrderStatuses,plan:this.plan}),this.setView("#-filter",this.filterView),this.setView("#-list",this.listView)},defineBindings:function(){var t=this.plan;this.listenTo(t,"sync",this.onPlanSynced),this.listenTo(t,"change:_id",this.onDateFilterChanged),this.listenTo(t.displayOptions,"change:mrps",this.onMrpsFilterChanged),this.listenTo(t.displayOptions,"change:lines",this.onLinesFilterChanged),this.listenTo(t.displayOptions,"change:whStatuses",this.onWhStatusesFilterChanged),this.listenTo(t.displayOptions,"change:psStatuses",this.onPsStatusesFilterChanged),this.listenTo(t.displayOptions,"change:from change:to",this.onStartTimeFilterChanged),this.listenTo(t.displayOptions,"change:useDarkerTheme",this.onDarkerThemeChanged),this.listenTo(t.settings,"changed",this.onSettingsChanged),this.listenTo(t.settings,"errored",this.reload),this.listenTo(t.settings.global,"change",this.onGlobalSettingChanged),this.listenTo(t.mrps,"reset",this.onMrpsReset),this.listenTo(t.sapOrders,"sync",this.onSapOrdersSynced),this.listenTo(this.listView,"statsRecounted",this.filterView.updateStats.bind(this.filterView)),this.listenTo(this.whOrderStatuses,"add",this.onWhOrderStatusAdded),this.listenTo(this.whOrderStatuses,"change:status",this.onWhOrderStatusChanged),e(document).on("click."+this.idPrefix,".paintShop-breadcrumb",this.onBreadcrumbsClick.bind(this))},load:function(t){var e=this.plan,s=O;return O=!1,t(d.load(s),this.delayReasons.fetch({reset:!0}),this.whOrderStatuses.fetch({reset:!0}),e.settings.fetch(),e.shiftOrders.fetch({reset:!0}),e.sapOrders.fetch({reset:!0}),e.fetch())},serialize:function(){return{idPrefix:this.idPrefix,darker:this.plan.displayOptions.isDarkerThemeUsed()}},afterRender:function(){d.load(!1),p.acquire()},reload:function(){var t=this,s=t.plan;function n(){s.set("loading",!1),i.msg.loadingFailed()}s.set("loading",!0),t.whOrderStatuses.date=s.id,t.promised(s.settings.set("_id",s.id).fetch()).then(function(){var i=e.when(t.whOrderStatuses.fetch({reset:!0}),s.shiftOrders.fetch({reset:!0,reload:!0}),s.sapOrders.fetch({reset:!0,reload:!0}),s.fetch());t.promised(i).then(s.set.bind(s,"loading",!1),n)},n)},updateUrl:function(){var t=this.plan;this.broker.publish("router.navigate",{url:"/planning/wh/"+t.id+"?mrps="+t.displayOptions.get("mrps")+"&lines="+t.displayOptions.get("lines")+"&whStatuses="+t.displayOptions.get("whStatuses")+"&psStatuses="+t.displayOptions.get("psStatuses")+"&from="+encodeURIComponent(t.displayOptions.get("from"))+"&to="+encodeURIComponent(t.displayOptions.get("to")),replace:!0,trigger:!1})},reloadOrders:function(){this.promised(this.plan.sapOrders.fetch({reset:!0}))},toggleLegend:function(t){if(this.$legendPopover)return this.$legendPopover.popover("destroy"),void(this.$legendPopover=null);this.$legendPopover=e(t).popover({trigger:"manual",placement:"left",html:!0,content:y({}),template:'<div class="popover planning-legend-popover"><div class="popover-content"></div></div>'}),this.$legendPopover.one("hide.bs.popover",function(){t.classList.remove("active")}),this.$legendPopover.popover("show"),t.classList.add("active")},onBreadcrumbsClick:function(t){if("A"===t.target.tagName)return!t.target.classList.contains("disabled")&&("showPicker"===t.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(t.target.dataset.action),!1)},showDatePickerDialog:function(){var t=new h({model:{date:this.plan.id}});this.listenTo(t,"picked",function(t){i.closeDialog(),t!==this.plan.id&&this.plan.set("_id",t)}),i.showDialog(t)},selectNonEmptyDate:function(t){e(".paintShop-breadcrumb").find("a").addClass("disabled");var a=this,r=+a.plan.getMoment().valueOf(),o="/planning/plans/?limit(1)&select(_id)&orders>()";o+="prev"===t?"&sort(-_id)&_id<"+r+"&_id>"+(r-2592e6):"&sort(_id)&_id>"+r+"&_id<"+(r+2592e6);var l=a.ajax({url:o});l.done(function(t){t.totalCount?a.plan.set("_id",n.utc.format(t.collection[0]._id,"YYYY-MM-DD")):i.msg.show({type:"warning",time:2500,text:s("paintShop","MSG:date:empty")})}),l.fail(function(){i.msg.show({type:"error",time:2500,text:s("paintShop","MSG:date:failure")})}),l.always(function(){a.layout&&a.layout.setBreadcrumbs(a.breadcrumbs,a)})},onDateFilterChanged:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this)),this.updateUrl(),this.plan.mrps.reset([]),this.plan.sapOrders.reset([]),this.plan.shiftOrders.reset([]),this.plan.orders.reset([]),this.plan.lines.reset([]),this.reload()},onMrpsFilterChanged:function(){this.updateUrl(),this.plan.mrps.reset()},onLinesFilterChanged:function(){this.updateUrl(),this.listView.scheduleRender()},onWhStatusesFilterChanged:function(){this.updateUrl()},onPsStatusesFilterChanged:function(){this.updateUrl()},onStartTimeFilterChanged:function(){this.updateUrl()},onDarkerThemeChanged:function(){this.$el.toggleClass("planning-darker",this.plan.displayOptions.isDarkerThemeUsed())},onPlanSynced:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this))},onSettingsChanged:function(t){t.reset&&this.plan.mrps.reset()},onGlobalSettingChanged:function(e){/ignoredMrps/.test(e.id)?"wh"===t.first(this.plan.displayOptions.get("mrps"))&&this.plan.mrps.reset():/.wh./.test(e.id)&&this.listView.scheduleRender()},onSapOrdersSynced:function(){this.timers.reloadOrders&&clearTimeout(this.timers.reloadOrders),this.timers.reloadOrders=setTimeout(this.reloadOrders.bind(this),6e5)},onMrpsReset:function(){this.listView.scheduleRender()},onWhOrderStatusAdded:function(t){this.filterView.updateStat(0,t.get("status"))},onWhOrderStatusChanged:function(t){var e=t.previous("status");"number"==typeof e&&this.filterView.updateStat(e,t.get("status"))}})});