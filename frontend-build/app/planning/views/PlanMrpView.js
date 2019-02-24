define(["underscore","app/time","app/i18n","app/user","app/core/View","app/data/orgUnits","./PlanMrpToolbarView","./PlanMrpLinesView","./PlanMrpOrdersView","./PlanMrpLateOrdersView","./PlanMrpLineOrdersView","./PlanMrpLineOrdersListView","app/planning/templates/planMrp"],function(e,i,s,n,t,r,l,a,d,o,p,h,m){"use strict";return t.extend({template:m,events:{"mouseleave #-lineOrders":function(){this.plan.displayOptions.isLineOrdersListEnabled()||(this.$els.crosshair.addClass("hidden"),this.$els.time.addClass("hidden"))},"mouseenter #-lineOrders":function(){this.plan.displayOptions.isLineOrdersListEnabled()||(this.$els.crosshair.removeClass("hidden"),this.$els.time.removeClass("hidden"))},"mousemove .planning-mrp-lineOrders-container":function(e){if(!this.plan.displayOptions.isLineOrdersListEnabled()){var s=this.$els.crosshair[0],n=this.$els.time[0],t=this.$els.lineOrders.position(),r=this.$els.lineOrders.outerWidth()-132,l=e.pageX-t.left-132,a=288e5*(l/r),d=+this.$(e.target).closest(".planning-mrp-lineOrders-list").attr("data-shift-start-time")+a,o=r-100+15;s.style.height=this.$els.lineOrders.outerHeight()+6+"px",s.style.top=t.top+"px",s.style.left=Math.max(147,e.pageX)+"px",l-=50,n.style.left=Math.min(l,o)+"px",n.innerHTML=i.toString(a/1e3,!0)+"<br>"+(d?i.utc.format(d,"HH:mm:ss"):""),s.classList.toggle("hidden",!d),n.classList.toggle("hidden",!d)}},contextmenu:function(){return!1}},initialize:function(){this.$els={lineOrders:null,timeline:null,crosshair:null,time:null},this.listenTo(this.plan,"change:loading",this.onLoadingChanged),this.listenTo(this.plan.displayOptions,"change:lineOrdersList",this.onLineOrdersListChanged),this.listenTo(this.plan.settings,"changed",this.onSettingsChanged),this.setView("#-toolbar",new l({delayReasons:this.delayReasons,plan:this.plan,mrp:this.mrp})),this.setView("#-lines",new a({plan:this.plan,mrp:this.mrp})),this.setView("#-orders",new d({plan:this.plan,mrp:this.mrp})),this.setView("#-lateOrders",new o({delayReasons:this.delayReasons,plan:this.plan,mrp:this.mrp}))},destroy:function(){var e=this;Object.keys(e.$els).forEach(function(i){e.$els[i]=null})},getTemplateData:function(){return{locked:this.plan.settings.isMrpLocked(this.mrp.id),mrp:{_id:this.mrp.id,name:this.mrp.id,description:this.mrp.get("description")}}},beforeRender:function(){clearTimeout(this.timers.render)},afterRender:function(){var e=this;Object.keys(e.$els).forEach(function(i){e.$els[i]=e.$id(i)}),e.$els.timeline.toggleClass("hidden",0===e.mrp.lines.length||e.plan.displayOptions.isLineOrdersListEnabled()),e.renderLineOrders()},renderLineOrders:function(){var e=this;e.removeView("#-lineOrders"),e.plan.displayOptions.isLineOrdersListEnabled()?e.renderLineOrdersList():[].concat(e.mrp.lines.models).sort(function(e,i){return e.id.localeCompare(i.id,void 0,{numeric:!0,ignorePunctuation:!0})}).forEach(function(i){e.insertView("#-lineOrders",new p({plan:e.plan,mrp:e.mrp,line:i,prodLineState:e.prodLineStates.get(i.id)})).render()})},renderLineOrdersList:function(){this.setView("#-lineOrders",new h({plan:this.plan,mrp:this.mrp,mode:"plan"})).render()},onLoadingChanged:function(){this.plan.isAnythingLoading()||(this.timers.render=setTimeout(this.render.bind(this),1))},onLineOrdersListChanged:function(){var e=this.plan.displayOptions.isLineOrdersListEnabled();this.$els.timeline.toggleClass("hidden",e),this.$els.crosshair.toggleClass("hidden",e),this.$els.time.toggleClass("hidden",e),this.renderLineOrders()},onSettingsChanged:function(e){e.locked&&this.$el.toggleClass("is-locked",this.plan.settings.isMrpLocked(this.mrp.id))}})});