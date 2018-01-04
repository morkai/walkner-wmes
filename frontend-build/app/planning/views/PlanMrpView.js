// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/time","app/i18n","app/user","app/core/View","app/data/orgUnits","./PlanMrpToolbarView","./PlanMrpLinesView","./PlanMrpOrdersView","./PlanMrpLateOrdersView","./PlanMrpLineOrdersView","./PlanMrpLineOrdersListView","app/planning/templates/planMrp"],function(e,i,n,s,r,t,l,a,d,p,o,h,m){"use strict";return r.extend({template:m,events:{"mouseleave #-lineOrders":function(){this.plan.displayOptions.isLineOrdersListEnabled()||(this.$els.crosshair.addClass("hidden"),this.$els.time.addClass("hidden"))},"mouseenter #-lineOrders":function(){this.plan.displayOptions.isLineOrdersListEnabled()||(this.$els.crosshair.removeClass("hidden"),this.$els.time.removeClass("hidden"))},"mousemove .planning-mrp-lineOrders-container":function(e){if(!this.plan.displayOptions.isLineOrdersListEnabled()){var n=288e5,s=132,r=50,t=147,l=this.$els.crosshair[0],a=this.$els.time[0],d=this.$els.lineOrders.position(),p=this.$els.lineOrders.outerWidth()-s,o=e.pageX-d.left-s,h=o/p,m=n*h,c=+this.$(e.target).closest(".planning-mrp-lineOrders-list").attr("data-shift-start-time"),O=c+m,u=p-2*r+15;l.style.height=this.$els.lineOrders.outerHeight()+6+"px",l.style.top=d.top+"px",l.style.left=Math.max(t,e.pageX)+"px",o-=r,a.style.left=Math.min(o,u)+"px",a.innerHTML=i.toString(m/1e3,!0)+"<br>"+(O?i.utc.format(O,"HH:mm:ss"):""),l.classList.toggle("hidden",!O),a.classList.toggle("hidden",!O)}},contextmenu:function(){return!1}},initialize:function(){var e=this;e.$els={lineOrders:null,timeline:null,crosshair:null,time:null},e.listenTo(e.plan,"change:loading",this.onLoadingChanged),e.listenTo(e.plan.displayOptions,"change:lineOrdersList",this.onLineOrdersListChanged),e.setView("#-toolbar",new l({delayReasons:e.delayReasons,plan:e.plan,mrp:e.mrp})),e.setView("#-lines",new a({plan:e.plan,mrp:e.mrp})),e.setView("#-orders",new d({plan:e.plan,mrp:e.mrp})),e.setView("#-lateOrders",new p({delayReasons:e.delayReasons,plan:e.plan,mrp:e.mrp}))},destroy:function(){var e=this;Object.keys(e.$els).forEach(function(i){e.$els[i]=null})},serialize:function(){return{idPrefix:this.idPrefix,mrp:{_id:this.mrp.id,name:this.mrp.id,description:this.mrp.get("description")}}},beforeRender:function(){clearTimeout(this.timers.render)},afterRender:function(){var e=this;Object.keys(e.$els).forEach(function(i){e.$els[i]=e.$id(i)}),e.$els.timeline.toggleClass("hidden",0===e.mrp.lines.length||e.plan.displayOptions.isLineOrdersListEnabled()),e.renderLineOrders()},renderLineOrders:function(){var e=this;return e.removeView("#-lineOrders"),e.plan.displayOptions.isLineOrdersListEnabled()?void e.renderLineOrdersList():void e.mrp.lines.forEach(function(i){e.insertView("#-lineOrders",new o({plan:e.plan,mrp:e.mrp,line:i,prodLineState:e.prodLineStates.get(i.id)})).render()})},renderLineOrdersList:function(){this.setView("#-lineOrders",new h({plan:this.plan,mrp:this.mrp,mode:"plan"})).render()},onLoadingChanged:function(){this.plan.isAnythingLoading()||(this.timers.render=setTimeout(this.render.bind(this),1))},onLineOrdersListChanged:function(){var e=this.plan.displayOptions.isLineOrdersListEnabled();this.$els.timeline.toggleClass("hidden",e),this.$els.crosshair.toggleClass("hidden",e),this.$els.time.toggleClass("hidden",e),this.renderLineOrders()}})});