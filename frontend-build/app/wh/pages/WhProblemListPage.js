define(["underscore","jquery","app/i18n","app/user","app/viewport","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/planning/Plan","app/planning/PlanSettings","app/planning/PlanDisplayOptions","../settings","../WhOrderCollection","../views/WhProblemFilterView","../views/WhProblemListView","../views/WhProblemDetailsView","app/wh/templates/problemListPage"],function(e,i,t,s,n,r,o,a,d,l,c,h,p,u,f,m,w,g){"use strict";var O=window.parent!==window||"/"!==window.location.pathname;return a.extend({template:g,layoutName:"page",breadcrumbs:function(){return[{label:this.t("BREADCRUMBS:base")},{label:this.t("BREADCRUMBS:problems")}]},actions:function(){return O?[{label:t("wh","PAGE_ACTION:pickup"),icon:"check-square-o",href:"/wh-pickup"}]:[]},remoteTopics:{"orders.updated.*":function(i){var t=n.currentDialog;if(t instanceof w){var s=i.change,r=s.newValues,o=t.plan.sapOrders.get(i._id);if(o){var a=e.clone(r);e.isEmpty(s.comment)||(a.comments=o.get("comments").concat({source:s.source,time:s.time,user:s.user,text:s.comment,delayReason:r.delayReason})),o.set(a)}}},"wh.orders.changed.*":function(e){var i=this;e.changes.changed.forEach(function(e){var t=i.whOrders.get(e._id);if(!t){if(!(n.currentDialog instanceof w&&n.currentDialog.model.id===e._id))return;t=n.currentDialog.model}t.set(e),e.status&&"problem"!==e.status&&i.whOrders.remove(t)}),e.changes.removed.forEach(function(e){i.whOrders.remove(e)})},"wh.orders.updated":function(e){var i=this;e.orders.forEach(function(e){var t=i.whOrders.get(e._id);if(!t&&n.currentDialog instanceof w&&n.currentDialog.model.id===e._id&&(t=n.currentDialog.model),t)return t.set(e),void("problem"!==e.status&&i.whOrders.remove(t));"problem"===e.status&&i.whOrders.add(e)})}},localTopics:{"socket.connected":function(){this.$el.removeClass("wh-is-disconnected"),this.load(e.noop)},"socket.disconnected":function(){this.$el.addClass("wh-is-disconnected")}},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){i(document).off("."+this.idPrefix),i(window).off("."+this.idPrefix),p.release()},setUpLayout:function(e){this.layout=e},defineModels:function(){this.displayOptions=h.fromLocalStorage({},{storageKey:"PLANNING:DISPLAY_OPTIONS:WH"}),this.whSettings=d(p.acquire(),this),this.whOrders=d(new u(null,{date:null,rqlQuery:"sort(startTime)&limit(0)&status=problem"}),this),this.model=this.whOrders},defineViews:function(){this.filterView=new f({displayOptions:this.displayOptions}),this.listView=new m({embedded:O,whSettings:this.whSettings,whOrders:this.whOrders}),this.setView("#-list",this.listView)},defineBindings:function(){this.listenTo(this.displayOptions,"change:useDarkerTheme",this.onDarkerThemeChanged)},load:function(e){return e(this.whSettings.fetchIfEmpty(),this.whOrders.fetch({reset:!0}))},getTemplateData:function(){return{darker:this.displayOptions.isDarkerThemeUsed()}},afterRender:function(){p.acquire()},onDarkerThemeChanged:function(){this.$el.toggleClass("planning-darker",this.displayOptions.isDarkerThemeUsed())}})});