// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../user","../time","../data/prodLog","../data/subdivisions","../core/Model","../core/util/getShiftEndDate","./util/decorateProdShiftOrder","./util/calcOrderEfficiency"],function(t,e,r,i,n,o,a,s,u){"use strict";return o.extend({urlRoot:"/prodShiftOrders",clientUrlRoot:"#prodShiftOrders",topicPrefix:"prodShiftOrders",privilegePrefix:"PROD_DATA",nlsDomain:"prodShiftOrders",initialize:function(t,e){o.prototype.initialize.apply(this,arguments),this.settings=e?e.settings:null},getLabel:function(t){var e=t===!1?"":this.get("prodLine")+": ";return e+this.get("orderId")+", "+this.get("operationNo")},serialize:function(t){return s(this,t)},serializeRow:function(t){var e=this.serialize(t);return e.className=this.get("mechOrder")||!this.get("sapTaktTime")?"":e.taktTimeOk?"success":"warning",e},onShiftChanged:function(){this.clear()},onOrderChanged:function(t,i,n){this.prepareOperations(i);var o=t.get("date"),a=r.getMoment().toDate();o>a&&(a=new Date(o.getTime())),this.set({prodShift:t.id,division:t.get("division"),subdivision:t.get("subdivision"),mrpControllers:t.get("mrpControllers"),prodFlow:t.get("prodFlow"),workCenter:t.get("workCenter"),prodLine:t.prodLine.id,date:o,shift:t.get("shift"),mechOrder:null===i.no,subdivisionType:this.getSubdivisionType(),orderId:i.no||i.nc12,operationNo:n,orderData:i,workerCount:0,totalQuantity:0,quantityDone:0,quantityLost:0,losses:null,creator:e.getInfo(),startedAt:a,finishedAt:null,master:t.get("master"),leader:t.get("leader"),operator:t.get("operator"),operators:t.get("operators"),spigot:null,sapTaktTime:null,lastTaktTime:null,avgTaktTime:null,totalQuantityDone:null}),this.set("sapTaktTime",this.getSapTaktTime()),this.generateId(t)},onOrderCorrected:function(t,r,i){var n=r.no||r.nc12;if(n===this.get("orderId")&&i===this.get("operationNo"))return null;this.prepareOperations(r);var o=this.get("spigot");o&&(o.forceCheck=!0);var a={mechOrder:null===r.no,orderId:n,operationNo:i,orderData:r,creator:e.getInfo(),sapTaktTime:this.getSapTaktTime()};return this.set(a),this.get("workerCount")>this.getMaxWorkerCount()&&t.changeWorkerCount(0),this.get("quantityDone")>this.getMaxQuantityDone()&&t.changeQuantityDone(0),a},onOrderContinued:function(t){this.set({prodShift:t.id,division:t.get("division"),subdivision:t.get("subdivision"),mrpControllers:t.get("mrpControllers"),prodFlow:t.get("prodFlow"),workCenter:t.get("workCenter"),prodLine:t.prodLine.id,date:t.get("date"),shift:t.get("shift"),subdivisionType:this.getSubdivisionType(),workerCount:0,totalQuantity:0,quantityDone:0,quantityLost:0,losses:null,creator:e.getInfo(),startedAt:r.getMoment().toDate(),finishedAt:null,master:t.get("master"),leader:t.get("leader"),operator:t.get("operator"),operators:t.get("operators"),spigot:null,sapTaktTime:null,lastTaktTime:null,avgTaktTime:null,totalQuantityDone:null}),this.set("sapTaktTime",this.getSapTaktTime()),this.generateId(t)},generateId:function(t){this.set("_id",i.generateId(this.get("startedAt"),t.id+this.get("orderId")))},onWorkEnded:function(){this.clear()},isMechOrder:function(){return this.get("mechOrder")},getOrderNo:function(){var t=this.get("orderData");return t?t.no||"?":"-"},getNc12:function(){var t=this.get("orderData");return t?t.nc12||"?":"-"},getProductName:function(){var t=this.get("orderData");return t?t.description||t.name||"?":"-"},getOperationName:function(){var t=this.get("orderData"),e=this.get("operationNo");return t&&e?t.operations&&t.operations[e]?t.operations[e].name||e:e:"-"},getDurationString:function(t,e){var i=Date.parse(this.get("startedAt")),n=Date.parse(this.get("finishedAt"))||t||Date.now();return r.toString(Math.round((n-i)/1e3),e)},getEfficiency:function(){return u(this.attributes)},getTaktTimeEfficiency:function(){var t=parseFloat(this.get("sapTaktTime")||this.getSapTaktTime())||0,e=parseFloat(this.getActualTaktTime())||0;return t&&e?Math.round(t/e*100):0},isTaktTimeOk:function(){var t=Math.round(this.get("avgTaktTime")/1e3)||0,e=this.get("sapTaktTime")||0;return e>=t},getSapTaktTime:function(t){var e=this.get("orderData"),r=this.get("operationNo");if(!e||!r)return 0;var i=e.operations?e.operations[r]:null;if(!i)return 0;var n=this.get("workerCount");if(n||(n=this.getWorkerCountSap()),"number"!=typeof n||0===n||i.laborTime<=0)return 0;t||(t=this.settings);var o=t?t.getTaktTimeCoeff(e.mrp,i.workCenter):1;return Math.max(Math.round(i.laborTime*o/n*3600/100),1)},getIptTaktTime:function(){return Math.round((this.get("iptTaktTime")||0)/1e3)},getLastTaktTime:function(){return Math.round((this.get("lastTaktTime")||0)/1e3)},getAvgTaktTime:function(){return Math.round((this.get("avgTaktTime")||0)/1e3)},getTaktTime:function(t){return this.get("orderData")&&this.get("operationNo")?this.getSapTaktTime(t)||"?":"-"},getActualTaktTime:function(){var t=this.getAvgTaktTime();if(t)return t;var e=r.getMoment(this.get("finishedAt"));if(!e.isValid())return"-";var i=e.diff(this.get("startedAt"),"seconds"),n=this.get("quantityDone");return n?Math.max(1,Math.round(i/n)):"?"},getWorkerCountSap:function(){var t=this.get("orderData"),e=this.get("operationNo");if(!t||!e)return"-";var r=t.operations?t.operations[e]:null;return!r||r.laborTime<=0||r.machineTime<=0?"?":Math.max(Math.round(r.laborTime/r.machineTime),1)},getWorkerCount:function(){return this.get("workerCount")||0},getWorkerCountForEdit:function(){var t=this.getWorkerCount();return 0!==t?t:(t=this.getWorkerCountSap(),"string"==typeof t||0===t?0:t)},getMaxWorkerCount:function(){var t=this.getWorkerCountSap();return"number"!=typeof t||this.settings.isTaktTimeEnabled(this.get("prodLine"))?15:t+Math.max(1,Math.round(.25*t))},getMaxQuantityDone:function(){var t=this.get("orderData");return t&&t.qty&&!this.settings.isTaktTimeEnabled(this.get("prodLine"))?Math.ceil(1.25*t.qty):999},getStartedAt:function(){var t=this.get("startedAt");return t?r.format(t,"LTS"):"?"},getQuantityDone:function(){return this.get("quantityDone")||0},getSubdivisionType:function(){var t=n.get(this.get("subdivision"));return t?t.get("type"):null},getSpigotComponent:function(e,r){var i=this.get("orderData");if(t.isEmpty(e)||!i||!Array.isArray(i.bom))return null;e=e.split("\n").map(function(t){return new RegExp(t,"i")}),r=t.isEmpty(r)?[]:r.split("\n").map(function(t){return new RegExp(t,"i")});for(var n=i.bom,o=0;o<n.length;++o){var a=n[o];if(this.isValidSpigotComponent(a,e,r))return a}return null},isValidSpigotComponent:function(e,r,i){if(t.isEmpty(e.nc12))return!1;for(var n=0;n<i.length;++n)if(i[n].test(e.name))return!1;for(var o=0;o<r.length;++o)if(r[o].test(e.name))return!0;return!1},getOrderIdType:function(){return"assembly"===this.getSubdivisionType()?"no":"nc12"},hasOrderData:function(){return!!this.get("orderId")&&!!this.get("operationNo")&&!!this.get("orderData")},isEditable:function(){return this.hasEnded()&&!this.isFromPressWorksheet()},hasEnded:function(){return null!=this.get("finishedAt")},isFromPressWorksheet:function(){return null!=this.get("pressWorksheet")},finish:function(){if(!this.id||this.hasEnded())return null;var t=r.getMoment().toDate(),e=a(this.get("date"),this.get("shift"));return t>e&&(t=e),this.set("finishedAt",t),{_id:this.id,finishedAt:t}},prepareOperations:function(e){if(Array.isArray(e.operations)){var r={};e.operations.forEach(function(t){""!==t.workCenter&&-1!==t.laborTime&&(r[t.no]=t)}),e.operations=r}else t.isObject(e.operations)||(e.operations={});return e}},{parse:function(t){return["date","startedAt","finishedAt","createdAt"].forEach(function(e){"string"==typeof t[e]&&(t[e]=new Date(t[e]))}),t}})});