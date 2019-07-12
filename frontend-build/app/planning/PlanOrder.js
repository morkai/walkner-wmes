define(["underscore","../core/Model"],function(t,e){"use strict";var n={small:"fa-star-o",easy:"fa-star-half-full",hard:"fa-star",unclassified:"fa-question-mark",late:"fa-hourglass-end",added:"fa-plus",incomplete:"fa-arrow-right",urgent:"fa-exclamation",pinned:"fa-thumb-tack",ignored:"fa-ban",psStatus:"fa-paint-brush",whStatus:"fa-level-down",eto:"fa-wrench"};return e.extend({getActualOrderData:function(){return this.pick(["quantityTodo","quantityDone","statuses"])},isAutoAdded:function(){return"incomplete"===this.attributes.source||"late"===this.attributes.source},isPinned:function(){return!t.isEmpty(this.attributes.lines)},hasCustomQuantity:function(){return this.attributes.quantityPlan>0&&"incomplete"!==this.attributes.source},getManHours:function(t){if(void 0===t&&(t=this.getQuantityTodo()),t<=0)return 0;var e=this.attributes.operation;if(!e.laborTime)return 0;var n=this.collection?this.collection.plan.settings.getSchedulingRate(this.attributes.mrp):1;return(e.laborTime/100*t+e.laborSetupTime)*n},getQuantityTodo:function(){var t=this.get("quantityPlan");return t>0?t:!this.collection||this.collection.plan.settings.attributes.useRemainingQuantity?Math.max(0,this.get("quantityTodo")-this.get("quantityDone")):this.get("quantityTodo")},getKindIcon:function(){return this.getIcon(this.attributes.kind)},getSourceIcon:function(){return this.getIcon(this.attributes.source)},getIcon:function(t){return n[t]||""},getStatus:function(){if(!this.collection||!this.collection.plan)return"unknown";var t=this.collection.plan.getActualOrderData(this.id);return t.quantityDone>t.quantityTodo?"surplus":t.quantityDone===t.quantityTodo?"completed":this.attributes.incomplete===this.getQuantityTodo()?"unplanned":this.attributes.incomplete>0?"incomplete":t.quantityDone>0?"started":"planned"},mapSapStatuses:function(t){var e={};return(t||this.get("statuses")).forEach(function(t){e[t]=!0}),e.deleted=e.TECO||e.DLFL||e.DLT,e}})});