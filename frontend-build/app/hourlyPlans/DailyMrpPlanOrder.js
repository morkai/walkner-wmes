// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../core/Model","../production/util/orderPickerHelpers","../orderStatuses/util/renderOrderStatusLabel","../orders/util/resolveProductName"],function(t,e,i,r,n){"use strict";return e.extend({defaults:{ignored:!1},serializeListItem:function(){return{_id:this.id,completed:this.isCompleted(),confirmed:this.isConfirmed(),delivered:this.isDelivered(),invalid:!this.isValid(),ignored:this.isIgnored(),surplus:this.isSurplus(),customQty:this.get("qtyPlan")>0}},serializePopover:function(){return t.assign(this.toJSON(),{plan:this.collection.plan.id,completed:this.isCompleted(),surplus:this.isSurplus(),statuses:(this.get("statuses")||[]).map(r),laborTime:this.getLaborTime()})},isSurplus:function(){return this.get("qtyDone")>this.get("qtyTodo")},isValid:function(){return this.isValidLaborTime()&&this.isValidOperation()&&this.isValidStatus()},isValidOperation:function(){var t=this.get("operation");return t&&t.laborTime>0},isValidStatus:function(){var t=this.get("statuses");return Array.isArray(t)&&t.length>0},isValidLaborTime:function(){return this.getLaborTime()>0},isIgnored:function(){return!!this.get("ignored")},isCompleted:function(){return this.get("qtyDone")>=this.get("qtyTodo")},isConfirmed:function(){return this.hasStatus("CNF")},isDelivered:function(){return this.hasStatus("DLV")},hasStatus:function(e){return t.includes(this.get("statuses"),e)},getLaborTime:function(){var t=this.get("rbh");if(t)return 100*t/this.get("qtyTodo");var e=this.get("operation");return e&&e.laborTime?e.laborTime:0},getPceTime:function(t){if(!t)return 0;var e=this.getLaborTime();return e?Math.floor(e/t/100*3600*1e3):0},update:function(e){var i={_id:this.id};void 0!==e.operation&&(i.operation=this.constructor.prepareOperation(e.operation)),!isNaN(e.qtyPlan)&&t.isNumber(e.qtyPlan)&&(i.qtyPlan=Math.max(0,e.qtyPlan)),"boolean"==typeof e.ignored&&(i.ignored=e.ignored);var r=this.attributes;t.some(i,function(e,i){return!t.isEqual(r[i],e)})&&this.collection.plan.collection.update("updateOrder",this.collection.plan.id,i)}},{prepareOperation:function(e){return e?t.pick(e,["no","workCenter","name","qty","machineTime","laborTime"]):null},prepareFromSapOrder:function(t,e){return{_id:t._id,nc12:t.nc12||"",name:n(t),rbh:e&&e.rbh?e.rbh:0,qtyPlan:0,qtyTodo:t.qty||0,qtyDone:t.qtyDone&&t.qtyDone.total?t.qtyDone.total||0:0,statuses:t.statuses||[],operation:this.prepareOperation(i.getBestDefaultOperation(t.operations))}},prepareFromMrpOrder:function(t){return{_id:t._id,nc12:t.nc12||"",name:t.name||"",rbh:t.rbh||0,qtyPlan:0,qtyTodo:t.qty||0,qtyDone:0,statuses:[],operation:null}},ORDER_PROPERTIES:["_id","nc12","name","description","qty","qtyDone.total","statuses","operations"]})});