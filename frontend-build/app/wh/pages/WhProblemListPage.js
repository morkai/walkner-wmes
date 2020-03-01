define(["underscore","jquery","app/i18n","app/user","app/viewport","app/time","app/core/Model","app/core/View","app/core/util/bindLoadingMessage","app/core/util/embedded","app/planning/Plan","app/planning/PlanSettings","app/planning/PlanDisplayOptions","../settings","../WhOrderCollection","../views/WhProblemFilterView","../views/WhProblemListView","../views/WhProblemDetailsView","app/wh/templates/problemListPage"],function(e,t,i,n,s,r,o,a,d,l,h,c,p,u,f,w,m,g,O){"use strict";var y=window.parent!==window||"/"!==window.location.pathname;return a.extend({template:O,layoutName:"page",breadcrumbs:function(){return[{label:this.t("BREADCRUMB:base"),href:y?null:"#wh/pickup/0d"},this.t("BREADCRUMB:problems")]},actions:function(){return y?[{label:i("wh","PAGE_ACTION:pickup"),icon:"check-square-o",href:"/wh-pickup"}]:[]},remoteTopics:{"orders.updated.*":function(t){var i=s.currentDialog;if(i instanceof g){var n=t.change,r=n.newValues,o=i.plan.sapOrders.get(t._id);if(o){var a=e.clone(r);e.isEmpty(n.comment)||(a.comments=o.get("comments").concat({source:n.source,time:n.time,user:n.user,text:n.comment,delayReason:r.delayReason})),o.set(a)}}},"old.wh.orders.changed.*":function(e){var t=this;e.changes.changed.forEach(function(e){var i=t.whOrders.get(e._id);if(!i){if(!(s.currentDialog instanceof g&&s.currentDialog.model.id===e._id))return;i=s.currentDialog.model}i.set(e),e.status&&"problem"!==e.status&&t.whOrders.remove(i)}),e.changes.removed.forEach(function(e){t.whOrders.remove(e)})},"old.wh.orders.updated":function(e){var t=this;e.updated.forEach(function(e){var i=t.whOrders.get(e._id),n=!1;if(!i&&s.currentDialog instanceof g&&s.currentDialog.model.id===e._id&&(i=s.currentDialog.model,n=!0),i)return i.set(e),void("problem"!==e.status?t.whOrders.remove(i):n&&t.whOrders.add(i));"problem"===e.status&&t.whOrders.add(e)})}},localTopics:{"socket.connected":function(){this.$el.removeClass("wh-is-disconnected"),this.load(e.noop)},"socket.disconnected":function(){this.$el.addClass("wh-is-disconnected")}},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings()},destroy:function(){t(document).off("."+this.idPrefix),t(window).off("."+this.idPrefix),u.release()},setUpLayout:function(e){this.layout=e},defineModels:function(){this.displayOptions=p.fromLocalStorage({},{storageKey:"PLANNING:DISPLAY_OPTIONS:WH"}),this.whSettings=d(u.acquire(),this),this.whOrders=d(new f(null,{date:null,rqlQuery:"sort(startTime)&limit(0)&status=problem"}),this),this.model=this.whOrders},defineViews:function(){this.filterView=new w({displayOptions:this.displayOptions}),this.listView=new m({embedded:y,whSettings:this.whSettings,whOrders:this.whOrders}),this.setView("#-list",this.listView)},defineBindings:function(){this.listenTo(this.displayOptions,"change:useDarkerTheme",this.onDarkerThemeChanged),this.listenToOnce(this,"afterRender",function(){window.parent.postMessage({type:"ready",app:window.WMES_APP_ID},"*")})},load:function(e){return e(this.whSettings.fetchIfEmpty(),this.whOrders.fetch({reset:!0}))},getTemplateData:function(){return{darker:this.displayOptions.isDarkerThemeUsed()}},afterRender:function(){u.acquire(),l.render(this)},onDarkerThemeChanged:function(){this.$el.toggleClass("planning-darker",this.displayOptions.isDarkerThemeUsed())}})});