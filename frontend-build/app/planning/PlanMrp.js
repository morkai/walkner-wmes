define(["../core/Model","../data/orgUnits","./PlanOrderCollection","./PlanLineCollection","./util/shift"],function(t,e,n,i,r){"use strict";return t.extend({initialize:function(){var t=e.getByTypeAndId("mrpController",this.id);this.attributes.description=t?t.get("description"):"",this.orders=new n(null,{paginate:!1}),this.lines=new i(null,{paginate:!1}),this.attributes.orders&&(this.orders.reset(this.attributes.orders),delete this.attributes.orders),this.attributes.lines&&(this.lines.reset(this.attributes.lines),delete this.attributes.lines),Object.defineProperty(this,"plan",{get:function(){return this.collection?this.collection.plan:null}}),Object.defineProperty(this,"settings",{get:function(){return this.plan.settings.mrps.get(this.id)}})},isLocked:function(){return!!this.settings.get("locked")},getStats:function(){var t=this.plan,e=this.orders,n=this.id,i={manHours:{todo:0,late:0,plan:0,remaining:0},quantity:{todo:0,late:0,plan:0,remaining:0},orders:{todo:0,late:0,plan:0,remaining:0},execution:{plan:0,done:0,percent:0,1:{plan:0,done:0,percent:0},2:{plan:0,done:0,percent:0},3:{plan:0,done:0,percent:0}}};if(!t)return i;this.lines.forEach(function(e){var o=[];e.orders.forEach(function(e){var i=t.orders.get(e.get("orderNo"));if(i&&i.get("mrp")===n)if(0!==o.length){var r=o[o.length-1];r[0].get("orderNo")===e.get("orderNo")?r.push(e):o.push([e])}else o.push([e])});var a=t.workingLines.getWorkingTimes(e);o.forEach(function(n){n.forEach(function(n){var o=r.getShiftNo(Date.parse(n.get("startAt"))),s=n.get("quantity"),u=t.shiftOrders.getLineOrderExecution(e.id,n,a),d=u.plannedQuantitiesDone.some(function(t){return t===s});i.manHours.plan+=n.get("manHours"),i.quantity.plan+=s,i.orders.plan+=1,i.execution.plan+=1,i.execution.done+=d?1:0,i.execution[o].plan+=1,i.execution[o].done+=u.quantityDoneOnShift===s?1:0})})}),i.execution.percent=i.execution.plan?Math.round(i.execution.done/i.execution.plan*100):100;for(var o=1;o<=3;++o)i.execution[o].percent=i.execution[o].plan?Math.round(i.execution[o].done/i.execution[o].plan*100):100;return e.forEach(function(e){var r=t.sapOrders.get(e.id);if(r&&e.get("mrp")===n){var o=r.get("quantityTodo")-r.getQuantityDone();i.manHours.todo+=e.get("manHours"),i.quantity.todo+=e.getQuantityTodo(),i.orders.todo+=1,i.manHours.remaining+=e.getManHours(o),i.quantity.remaining+=o,i.orders.remaining+=o>0?1:0}}),t.lateOrders.mrp(this.id).forEach(function(t){e.get(t.id)||(i.manHours.late+=t.get("manHours"),i.quantity.late+=t.getQuantityTodo(),i.orders.late+=1)}),i}})});