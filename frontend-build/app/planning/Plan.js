// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../core/Model","../core/Collection","../data/orgUnits"],function(t,e,i,r,n){"use strict";function s(e,s){var o=n.getByTypeAndId("mrpController",s),l=t.find(e.settings.get("mrps"),{_id:s});this.plan=e,this.date=e.id,this.mrp={_id:s,description:o?o.get("description"):""},this.orders=new r(e.orders.where({mrp:s}),{model:i,paginate:!1}),this.lines=new r(l?l.lines.map(function(n){var s=n._id,o=t.find(e.settings.get("lines"),{_id:s}),l=e.lines.get(s),a=new i({_id:s,activeFrom:o.activeFrom,activeTo:o.activeTo,mrpPriority:o.mrpPriority,orderPriority:n.orderPriority,workerCount:n.workerCount,hourlyPlan:l?l.get("hourlyPlan"):[]});return a.orders=new r(l?l.get("orders"):[],{model:i,paginate:!1}),a}):[],{model:i,paginate:!1})}return s.prototype.isPrintOrderTimes=function(){return!!this.plan.options.get("printOrderTimes")},s.prototype.togglePrintOrderTimes=function(){this.plan.options.set("printOrderTimes",!this.plan.options.get("printOrderTimes"))},i.extend({urlRoot:"/planning/plans",clientUrlRoot:"#planning/plans",topicPrefix:"planning.plans",privilegePrefix:"PLANNING",nlsDomain:"planning",initialize:function(t,e){this.urlQuery=e&&e.urlQuery||"",this.options=e&&e.options,this.settings=e&&e.settings,null===this.attributes.mrpFilter&&(this.attributes.mrpFilter=JSON.parse(localStorage.getItem("PLANNING:MRP_FILTER")||"[]")),e&&e.cache&&(this.orders=new r(this.attributes.orders,{model:i,paginate:!1}),this.lines=new r(this.attributes.lines,{model:i,paginate:!1}),this.on("sync",this.cache.bind(this)))},cache:function(){this.orders.reset(this.attributes.orders),this.lines.reset(this.attributes.lines)},url:function(){return this.urlRoot+"/"+this.id+"?"+this.urlQuery},parse:function(t){return t._id=e.utc.format(this.id,"YYYY-MM-DD"),t},getLabel:function(){return e.utc.format(this.id,"LL")},getFilter:function(){return{date:e.utc.format(this.id,"YYYY-MM-DD"),mrp:this.get("mrpFilter").join(",")}},setFilter:function(t){var e={};t.date&&(e._id=t.date,e.createdAt=null,e.updatedAt=null,e.orders=[],e.lines=[],this.settings.set({_id:t.date})),t.mrp&&(e.mrpFilter=t.mrp,localStorage.setItem("PLANNING:MRP_FILTER",JSON.stringify(t.mrp))),this.set(e)},getOrderedMrps:function(){var t=this.get("mrpFilter");return t.length?t.slice():this.settings.get("mrps").map(function(t){return t._id}).sort(function(t,e){return t.localeCompare(e,void 0,{numeric:!0})})},serializeMrps:function(){return this.getOrderedMrps().map(function(t){return this.serializeMrp(t)},this)},serializeMrp:function(t){return new s(this,t)}})});