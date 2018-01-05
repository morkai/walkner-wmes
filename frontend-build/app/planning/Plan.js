// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../time","../user","../socket","../core/Model","../data/orgUnits","./util/shift","./changeHandlers","./PlanOrderCollection","./PlanLineCollection","./PlanMrpCollection","./PlanShiftOrderCollection","./PlanSapOrderCollection","./PlanLateOrderCollection"],function(t,e,i,n,s,r,a,o,l,d,u,h,c,p,f){"use strict";return r.extend({urlRoot:"/planning/plans",clientUrlRoot:"#planning/plans",topicPrefix:"planning.plans",privilegePrefix:"PLANNING",nlsDomain:"planning",defaults:{active:!1,loading:!1},initialize:function(e,i){i=t.defaults({},i,{displayOptions:null,settings:null,sapOrders:null,minMaxDates:!1,pceTimes:!1}),this.urlQuery="minMaxDates="+(i.minMaxDates?1:0)+"&pceTimes="+(i.pceTimes?1:0),this.displayOptions=i.displayOptions,this.settings=i.settings,this.shiftOrders=new c(null,{plan:this,paginate:!1}),this.lateOrders=new f(null,{plan:this,paginate:!1}),this.sapOrders=new p(null,{plan:this,paginate:!1}),this.orders=new d(null,{plan:this,paginate:!1}),this.lines=new u(null,{plan:this,paginate:!1}),this.mrps=new h(null,{plan:this,paginate:!1}),this.lines.on("reset",function(){this.mrps.reset()},this),this.attributes.orders&&(this.orders.reset(this.attributes.orders),delete this.attributes.orders),this.attributes.lines&&(this.lines.reset(this.attributes.lines),delete this.attributes.lines)},url:function(){return this.urlRoot+"/"+this.id+"?"+this.urlQuery},parse:function(e){var n={};return e._id&&(n._id=i.utc.format(e._id,"YYYY-MM-DD")),e.createdAt&&(n.createdAt=new Date(e.createdAt)),e.updatedAt&&(n.updatedAt=new Date(e.updatedAt)),n.active=o.isActive(n._id||this.id),(e.minDate||e.maxDate)&&this.displayOptions.set(t.pick(e,["minDate","maxDate"])),e.orders&&this.orders.reset(e.orders),e.lines&&this.lines.reset(e.lines),n},getLabel:function(){return i.utc.format(this.id,"L")},getMoment:function(){return i.utc.getMoment(this.id,"YYYY-MM-DD")},getActualOrderData:function(t){return this.displayOptions.isLatestOrderDataUsed()?(this.sapOrders.get(t)||this.orders.get(t)).getActualOrderData():this.orders.get(t).getActualOrderData()},isAnythingLoading:function(){return this.get("loading")},isProdStateUsed:function(){return this.isActive()&&this.displayOptions.isLatestOrderDataUsed()},isActive:function(){return this.attributes.active===!0},isFrozen:function(){return this.attributes.frozen===!0},isEditable:function(){return"development"===window.ENV&&n.isAllowedTo("SUPER")||!this.isFrozen()&&this.settings.isEditable()},canEditSettings:function(){return this.isEditable()&&n.isAllowedTo("PLANNING:MANAGE","PLANNING:PLANNER")},canCommentOrders:function(){return n.can.commentOrders()},canFreezeOrders:function(){return!("development"!==window.ENV||!n.isAllowedTo("SUPER"))||!!this.canEditSettings()&&(Date.now()>=i.getMoment(this.id,"YYYY-MM-DD").add(23,"hours").valueOf()||this.lines.some(function(t){return t.getFrozenOrderCount()>0}))},canChangeDropZone:function(){return n.isAllowedTo("ORDERS:MANAGE","PLANNING:PLANNER","PLANNING:WHMAN","FN:master","FN:leader")},canChangeWhDropZone:function(){return n.isAllowedTo("ORDERS:MANAGE","PLANNING:PLANNER","FN:master","FN:leader")},canChangeWhStatus:function(){return n.isAllowedTo("PLANNING:WHMAN")},applyChange:function(t){var e=this;i.utc.format(t.plan,"YYYY-MM-DD")===e.id&&(e.set("updatedAt",new Date(t.date)),Object.keys(t.data).forEach(function(i){l[i]&&l[i](e,t.data[i])}))},getOrderList:function(e,i){var n=[];return this.mrps.forEach(function(s){if(e[s.id]){var r={};s.lines.forEach(function(t){t.orders.forEach(function(t){var e=t.get("orderNo"),i=s.orders.get(e);if(i){var n=r[e];n||(n=r[e]={orderNo:e,shiftNo:Number.MAX_VALUE,startTime:Number.MAX_VALUE});var a=t.getShiftNo();a<n.shiftNo&&(n.shiftNo=a);var o=Date.parse(t.get("startAt"));o<n.startTime&&(n.startTime=o)}})}),t.values(r).sort(function(t,e){return t.startTime-e.startTime}).forEach(function(t){i&&t.shiftNo!==i||n.push(t.orderNo)})}}),n}},{applySettingsChanges:function(t,e){e.length&&l.settings(new this(null,{settings:t}),e)}})});