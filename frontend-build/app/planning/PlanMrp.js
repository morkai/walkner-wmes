define(["../core/Model","../data/orgUnits","./PlanOrderCollection","./PlanLineCollection","./util/shift"],function(t,e,n,i,r){"use strict";return t.extend({initialize:function(){var t=e.getByTypeAndId("mrpController",this.id);this.attributes.description=t?t.get("description"):"",this.orders=new n(null,{paginate:!1}),this.lines=new i(null,{paginate:!1}),this.attributes.orders&&(this.orders.reset(this.attributes.orders),delete this.attributes.orders),this.attributes.lines&&(this.lines.reset(this.attributes.lines),delete this.attributes.lines),Object.defineProperty(this,"plan",{get:function(){return this.collection?this.collection.plan:null}}),Object.defineProperty(this,"settings",{get:function(){return this.plan.settings.mrps.get(this.id)}})},isLocked:function(){return!!this.settings.get("locked")},getStats:function(){var t=this.orders,e=this.plan,n=this.id,i={manHours:{todo:0,late:0,plan:0,remaining:0},quantity:{todo:0,late:0,plan:0,remaining:0},execution:{plan:0,done:0,percent:0,1:{plan:0,done:0,percent:0},2:{plan:0,done:0,percent:0},3:{plan:0,done:0,percent:0}},orders:{todo:0,late:0,plan:0,remaining:0}};this.lines.forEach(function(t){t.orders.forEach(function(o){var a=e.orders.get(o.get("orderNo"));if(a.get("mrp")===n){var s=Date.parse(o.get("startAt")),u=r.getShiftNo(s),d=e.shiftOrders.getTotalQuantityDone(t.id,u,a.id),l=o.get("quantity");i.manHours.plan+=o.get("manHours"),i.quantity.plan+=o.get("quantity"),i.orders.plan+=1,i.execution.plan+=1,i.execution.done+=d>=l?1:0,i.execution[u].plan+=1,i.execution[u].done+=d>=l?1:0}})}),i.execution.percent=i.execution.plan?Math.round(i.execution.done/i.execution.plan*100):100;for(var o=1;o<=3;++o)i.execution[o].percent=i.execution[o].plan?Math.round(i.execution[o].done/i.execution[o].plan*100):100;return e&&(t.forEach(function(t){var r=e.sapOrders.get(t.id);if(r&&t.get("mrp")===n){var o=r.get("quantityTodo")-r.getQuantityDone();i.manHours.todo+=t.get("manHours"),i.quantity.todo+=t.getQuantityTodo(),i.orders.todo+=1,i.manHours.remaining+=t.getManHours(o),i.quantity.remaining+=o,i.orders.remaining+=o>0?1:0}}),e.lateOrders.mrp(this.id).forEach(function(e){t.get(e.id)||(i.manHours.late+=e.get("manHours"),i.quantity.late+=e.getQuantityTodo(),i.orders.late+=1)})),i}})});