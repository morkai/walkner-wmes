define(["underscore","jquery","app/i18n","app/viewport","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/delayReasons/DelayReasonCollection","app/factoryLayout/productionState","app/paintShop/views/PaintShopDatePickerView","app/wh-lines/WhLineCollection","app/planning-orderGroups/OrderGroupCollection","../Plan","../PlanSettings","../PlanDisplayOptions","../views/PlanFilterView","../views/PlanMrpView","../views/CopySettingsDialogView","app/planning/templates/planPage","app/planning/templates/planLegend","app/planning/templates/planSettingsPageAction","app/planning/templates/whPageAction"],function(e,t,i,n,s,r,a,o,l,d,p,h,c,u,g,f,m,y,v,w,b,O,S){"use strict";var k=!1;return a.extend({template:w,layoutName:"page",modelProperty:"plan",breadcrumbs:function(){return[{href:"#planning/plans",label:this.t("BREADCRUMB:base")},{href:"#planning/plans/"+this.plan.id,label:this.plan.getLabel(),template:function(e){return'<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+e.href+'" data-action="showPicker">'+e.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}}]},actions:function(){var e=this,t=s.getMoment(e.plan.id,"YYYY-MM-DD").hours(6);return[{label:e.t("PAGE_ACTION:hourlyPlans"),icon:"calendar",privileges:"HOURLY_PLANS:VIEW",href:"#hourlyPlans?sort(-date)&limit(-1337)&date=ge="+t.valueOf()+"&date=lt="+t.add(1,"days").valueOf()},{label:e.t("PAGE_ACTION:paintShop"),icon:"paint-brush",privileges:"PAINT_SHOP:VIEW",href:"#paintShop/"+e.plan.id},{privileges:"WH:VIEW",template:function(){return S({id:e.plan.id})}},{label:e.t("PAGE_ACTION:changes"),icon:"list-ol",href:"#planning/changes?sort(date)&plan="+e.plan.id},{template:function(){return e.renderPartialHtml(O,{id:e.plan.id,editable:e.plan.isEditable()})},afterRender:function(t){t.find('[data-action="openSettings"]').on("click",function(t){if(0===t.button&&!t.ctrlKey&&e.plan.isEditable())return e.broker.publish("router.navigate",{url:"/planning/settings/"+e.plan.id+"?back=1",trigger:!0,replace:!1}),!1}),t.find('[data-action="copySettings"]').on("click",function(){if(!this.parentNode.classList.contains("disabled")){var t=new v({model:e.plan});return n.showDialog(t,e.t("copySettings:title")),!1}})}},{label:e.t("PAGE_ACTION:legend"),icon:"question-circle",callback:function(){return e.toggleLegend(this.querySelector(".btn")),!1}}]},remoteTopics:{"planning.changes.created":function(e){this.plan.applyChange(e)},"planning.generator.started":function(e){e.date!==this.plan.id||this.$msg||(this.$msg=n.msg.show({type:"info",text:this.t("MSG:GENERATING")}))},"planning.generator.finished":function(e){var t=this.$msg;t&&e.date===this.plan.id&&(n.msg.hide(t),this.$msg=null)},"orders.synced":function(){this.reloadOrders(),this.reloadWorkingLines()},"orders.updated.*":function(t){var i=this.plan.lateOrders.get(t._id),n=t.change,s=n.newValues;i&&void 0!==s.delayReason&&i.set("delayReason",s.delayReason);var r=this.plan.sapOrders.get(t._id);if(r){var a=e.clone(s);e.isEmpty(n.comment)||(a.comments=r.get("comments").concat({source:n.source,time:n.time,user:n.user,text:n.comment,delayReason:s.delayReason})),r.set(a)}},shiftChanged:function(e){this.plan.set("active",s.format(e.date,"YYYY-MM-DD")===this.plan.id)},"production.stateChanged.**":function(e){this.plan.shiftOrders.update(e)},"old.wh.lines.updated":function(e){this.plan.whLines.length&&this.plan.whLines.handleUpdate(e)}},localTopics:{"socket.connected":function(){this.reload(!0)},"socket.disconnected":function(){k=!0},"planning.mrpStatsRecounted":"scheduleStatRecount"},events:{"click #-mrpSelector":"hideMrpSelector","click #-mrpSelector .btn":function(e){this.scrollToMrp(e.currentTarget.dataset.mrp)}},initialize:function(){this.$msg=null,this.keysPressed=["","",""],this.lastKeyPressAt=0,this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){t(document).off("."+this.idPrefix),t(window).off("."+this.idPrefix),d.unload()},setUpLayout:function(e){this.layout=e},defineModels:function(){var e=this.plan=new u({_id:this.options.date},{displayOptions:f.fromLocalStorage({division:this.options.division,mrps:this.options.mrps}),settings:g.fromDate(this.options.date),minMaxDates:!0,activeMrps:!0});e.whLines=new h(null,{paginate:!1}),this.delayReasons=new l(null,{rqlQuery:"sort(name)&limit(0)",paginate:!1}),this.orderGroups=new c(null,{rqlQuery:"select(name,mrp)&sort(name)&limit(0)&target=plan",paginate:!1,sortByName:!0}),o(d,this),o(this.delayReasons,this),o(this.orderGroups,this),o(e,this),o(e.settings,this),o(e.workingLines,this),o(e.lateOrders,this),o(e.sapOrders,this),o(e.shiftOrders,this),window.plan=e},defineViews:function(){this.filterView=new m({plan:this.plan}),this.setView("#-filter",this.filterView)},defineBindings:function(){var i=this,n=i.plan,s=n.displayOptions;i.listenTo(n,"sync",i.onPlanSynced),i.listenTo(n,"change:_id",i.onDateFilterChanged),i.listenTo(n.settings,"changed",i.onSettingsChanged),i.listenTo(n.settings,"errored",function(){i.reload(!0)}),i.listenTo(n.orders,"added",i.reloadOrders.bind(i,!0)),i.listenTo(n.sapOrders,"sync",i.onSapOrdersSynced),i.once("afterRender",function(){i.listenTo(s,"change:mrps change:division",e.debounce(i.onMrpsFilterChanged.bind(i),1)),i.listenTo(s,"change:wrapLists",i.onWrapListsChanged),i.listenTo(s,"change:useDarkerTheme",i.onDarkerThemeChanged),i.listenTo(s,"change:useLatestOrderData",i.updateUrl),i.listenTo(n.mrps,"reset",e.debounce(i.renderMrps.bind(i),1)),i.options.order&&i.focusOrder(i.options.order)}),t(document).on("click."+i.idPrefix,".paintShop-breadcrumb",i.onBreadcrumbsClick.bind(i)),t(window).on("resize."+i.idPrefix,e.debounce(i.onWindowResize.bind(i),16)).on("keydown."+i.idPrefix,i.onWindowKeyDown.bind(i)).on("keyup."+i.idPrefix,i.onWindowKeyUp.bind(i))},load:function(e){var i=this,n=i.plan,s=k,r=t.Deferred();k=!1;var a=t.when(i.promised(d.load(s)),i.promised(i.delayReasons.fetch({reset:!0})),i.promised(i.orderGroups.fetch({reset:!0})),i.promised(n.settings.fetch()),i.promised(n.workingLines.fetch({reset:!0})),i.promised(n.shiftOrders.fetch({reset:!0})),i.promised(n.sapOrders.fetch({reset:!0})),1===n.settings.getVersion()?i.promised(n.lateOrders.fetch({reset:!0})):null,i.promised(n.whLines.fetch({reset:!0})));return a.fail(function(){r.reject.apply(r,arguments)}),a.done(function(){var e=i.promised(n.fetch());e.fail(function(){r.reject.apply(r,arguments)}),e.done(function(){r.resolve()})}),e(r.promise())},getTemplateData:function(){return{wrap:this.plan.displayOptions.isListWrappingEnabled(),darker:this.plan.displayOptions.isDarkerThemeUsed()}},afterRender:function(){d.load(!1),this.renderMrps()},reload:function(e){var i=this,s=i.plan;function r(){s.set("loading",!1),n.msg.loadingFailed()}s.set("loading",!0),i.promised(s.settings.set("_id",s.id).fetch()).then(function(){var n={reset:!0,reload:!0},a=k;k=!1;var o=t.when(d.load(a),e?i.delayReasons.fetch(n):null,e?i.orderGroups.fetch(n):null,e?s.whLines.fetch(n):null,s.workingLines.fetch(n),s.shiftOrders.fetch(n),s.sapOrders.fetch(n),1===s.settings.getVersion()?s.lateOrders.fetch(n):null,s.fetch());i.promised(o).then(s.set.bind(s,"loading",!1),r)},r)},updateUrl:function(){var e=this.plan;this.broker.publish("router.navigate",{url:"/planning/plans/"+e.id+"?division="+(e.displayOptions.get("division")||"")+"&mrps="+e.displayOptions.get("mrps").join(",")+"&sapOrders="+(e.displayOptions.isLatestOrderDataUsed()?1:0),replace:!0,trigger:!1})},renderMrps:function(){var e=this,t=e.plan.isAnythingLoading();e.removeView("#-mrps"),e.plan.mrps.forEach(function(i){var n=new y({delayReasons:e.delayReasons,orderGroups:e.orderGroups,prodLineStates:d.prodLineStates,plan:e.plan,mrp:i});e.insertView("#-mrps",n),t||n.render()}),this.$id("empty").toggleClass("hidden",e.plan.mrps.length>0),this.$id("mrps").toggleClass("hidden",0===e.plan.mrps.length),clearTimeout(this.timers.recountStats),this.recountStats()},reloadOrders:function(e){this.timers.reloadOrders&&(clearTimeout(this.timers.reloadOrders),this.timers.reloadOrders=null),e||1!==this.plan.settings.getVersion()||this.promised(this.plan.lateOrders.fetch({reset:!0})),this.promised(this.plan.sapOrders.fetch({reset:!0}))},reloadWorkingLines:function(){this.promised(this.plan.workingLines.fetch({reset:!0}))},scheduleStatRecount:function(){this.timers.recountStats&&clearTimeout(this.timers.recountStats),this.timers.recountStats=setTimeout(this.recountStats.bind(this),10)},recountStats:function(){this.filterView.recountStats()},toggleLegend:function(e){if(this.$legendPopover)return this.$legendPopover.popover("destroy"),void(this.$legendPopover=null);this.$legendPopover=t(e).popover({trigger:"manual",placement:"left",html:!0,content:b({}),template:'<div class="popover planning-legend-popover"><div class="popover-content"></div></div>'}),this.$legendPopover.one("hide.bs.popover",function(){e.classList.remove("active")}),this.$legendPopover.popover("show"),e.classList.add("active")},toggleLineOrdersList:function(){var e=this.$(".planning-mrp"),t=window.scrollY,i=null;if(e.length>1&&t>e[0].offsetTop&&(i=e[e.length-1],t+window.innerHeight<document.scrollingElement.scrollHeight))for(var n=0;n<e.length&&!(t<(i=e[n]).offsetTop+125);++n);this.plan.displayOptions.toggleLineOrdersList(),i&&window.scrollTo(0,i.offsetTop-(e[0]===i?10:-1))},onBreadcrumbsClick:function(e){if("A"===e.target.tagName)return!e.target.classList.contains("disabled")&&("showPicker"===e.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(e.target.dataset.action),!1)},showDatePickerDialog:function(){var e=new p({model:{date:this.plan.id}});this.listenTo(e,"picked",function(e){n.closeDialog(),e!==this.plan.id&&this.plan.set("_id",e)}),n.showDialog(e)},selectNonEmptyDate:function(e){t(".paintShop-breadcrumb").find("a").addClass("disabled");var r=this,a=+r.plan.getMoment().valueOf(),o="/planning/plans/?limit(1)&select(_id)&orders>()";o+="prev"===e?"&sort(-_id)&_id<"+a+"&_id>"+(a-2592e6):"&sort(_id)&_id>"+a+"&_id<"+(a+2592e6);var l=r.ajax({url:o});l.done(function(e){e.totalCount?r.plan.set("_id",s.utc.format(e.collection[0]._id,"YYYY-MM-DD")):n.msg.show({type:"warning",time:2500,text:i("paintShop","MSG:date:empty")})}),l.fail(function(){n.msg.show({type:"error",time:2500,text:i("paintShop","MSG:date:failure")})}),l.always(function(){r.layout&&r.layout.setBreadcrumbs(r.breadcrumbs,r)})},showMrpSelector:function(){if(1!==this.plan.mrps.length){var e={};this.plan.mrps.forEach(function(t){var i=t.id.substring(0,2);e[i]||(e[i]=[]),e[i].push(t.id)});var t="",i=0;Object.keys(e).sort().forEach(function(n){t+='<div class="planning-mrpSelector-row">',e[n].sort().forEach(function(e){var n=10===++i?0:i<10?i:-1;t+='<button type="button" class="btn btn-default btn-lg" data-mrp="'+e+'" data-key="'+n+'">'+e+(n>=0?"<kbd>"+n+"</kbd>":"")+"</button>"}),t+="</div>"}),this.$(".planning-mrpSelector-mrps").html(t),this.$id("mrpSelector").removeClass("hidden")}},hideMrpSelector:function(){this.$id("mrpSelector").addClass("hidden")},scrollToMrp:function(e){var i=this.$('.planning-mrp[data-id="'+e+'"]'),n=i.prop("offsetTop");i.prev().length||(n-=10),t("html, body").animate({scrollTop:n},"fast","swing")},onDateFilterChanged:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this)),this.updateUrl(),this.plan.mrps.reset([]),this.plan.sapOrders.reset([]),this.plan.shiftOrders.reset([]),this.plan.lateOrders.reset([]),this.plan.orders.reset([]),this.plan.lines.reset([]),this.reload()},onMrpsFilterChanged:function(){this.updateUrl(),this.plan.mrps.reset()},onWrapListsChanged:function(){this.$el.toggleClass("wrap",this.plan.displayOptions.isListWrappingEnabled())},onDarkerThemeChanged:function(){this.$el.toggleClass("planning-darker",this.plan.displayOptions.isDarkerThemeUsed())},onPlanSynced:function(){this.layout&&(this.layout.setBreadcrumbs(this.breadcrumbs,this),this.layout.setActions(this.actions,this))},onSettingsChanged:function(e){e.reset&&this.plan.mrps.reset()},onSapOrdersSynced:function(){this.timers.reloadOrders&&clearTimeout(this.timers.reloadOrders),this.timers.reloadOrders=setTimeout(this.reloadOrders.bind(this),6e5)},onWindowResize:function(e){this.broker&&this.broker.publish("planning.windowResized",e)},onWindowKeyDown:function(e){if(32===e.keyCode&&"INPUT"!==e.target.tagName&&"TEXTAREA"!==e.target.tagName&&"BUTTON"!==e.target.tagName&&"A"!==e.target.tagName)return!1},onWindowKeyUp:function(e){if(27===e.keyCode)this.broker.publish("planning.escapePressed"),this.hideMrpSelector();else if("INPUT"!==e.target.tagName&&"TEXTAREA"!==e.target.tagName&&"BUTTON"!==e.target.tagName&&"A"!==e.target.tagName){var t=!1;if(e.keyCode>=48&&e.keyCode<=90){this.keysPressed.shift(),this.keysPressed.push(e.originalEvent.key);var i=this.keysPressed.join("").toUpperCase();this.plan.mrps.get(i)?(this.scrollToMrp(i),t=!0):t=e.timeStamp-this.lastKeyPressAt<=500}t||79!==e.keyCode&&90!==e.keyCode?32===e.keyCode?this.$id("mrpSelector").hasClass("hidden")?this.showMrpSelector():this.hideMrpSelector():e.keyCode>=48&&e.keyCode<=57&&!this.$id("mrpSelector").hasClass("hidden")&&this.$('.planning-mrpSelector-row > .btn[data-key="'+(e.keyCode-48)+'"]').click():this.toggleLineOrdersList()}this.lastKeyPressAt=e.timeStamp},focusOrder:function(e){var t=this.plan.orders.get(e);if(t){var i=this.plan.mrps.get(t.get("mrp"));i&&i.orders.trigger("preview",{source:"page",orderNo:t.id})}}})});