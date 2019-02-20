define(["underscore","app/core/Model"],function(t,e){"use strict";return e.extend({initialize:function(t,e){this.prodLineId=e.prodLineId},url:function(){return"/production/planExecution/"+this.prodLineId+"?queue=0"},parse:function(t){return t.execution},startDowntime:function(t){var e=this.get("doneDowntimes")||[],i=this.serializeDowntime(t),n=e.concat(i);this.set("doneDowntimes",n)},updateDowntime:function(e){var i=this.get("doneDowntimes")||[],n=i[i.length-1];n&&(t.assign(n,this.serializeDowntime(e)),this.trigger("change:lastDowntime",n))},startOrder:function(t){var e=this.get("doneOrders")||[],i=this.serializeOrder(t),n=e.concat(i);this.set("doneOrders",n)},updateOrder:function(e){var i=this.get("doneOrders")||[],n=i[i.length-1];n&&(t.assign(n,this.serializeOrder(e)),this.trigger("change:lastOrder",n))},serializeDowntime:function(t){var e=t.get("finishedAt");return{reason:t.get("reason"),aor:t.get("aor"),startedAt:t.get("startedAt").toISOString(),finishedAt:e?e.toISOString():null}},serializeOrder:function(t){var e=t.get("finishedAt");return{orderId:t.get("orderId"),operationNo:t.get("operationNo"),quantityDone:t.get("quantityDone"),workerCount:t.get("workerCount"),startedAt:t.get("startedAt").toISOString(),finishedAt:e?e.toISOString():null,taktTime:t.get("avgTaktTime")&&t.get("sapTaktTime")?t.isTaktTimeOk()?"ok":"nok":"na"}}})});