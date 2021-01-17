define(["underscore","app/i18n","app/user","app/time","app/data/prodLog","app/data/orgUnits","app/data/downtimeReasons","app/core/Model","app/core/util/getShiftStartInfo","app/core/util/getShiftEndDate","app/core/templates/userInfo","app/orders/util/resolveProductName"],function(t,e,r,i,o,n,a,s,d,u,p,g){"use strict";return s.extend({urlRoot:"/prodShiftOrders",clientUrlRoot:"#prodShiftOrders",topicPrefix:"prodShiftOrders",privilegePrefix:"PROD_DATA",nlsDomain:"prodShiftOrders",initialize:function(t,e){s.prototype.initialize.apply(this,arguments),this.settings=e?e.settings:null},getLabel:function(t){return(!1===t?"":this.get("prodLine")+": ")+this.get("orderId")+", "+this.get("operationNo")},serialize:function(t){var o=this.toJSON(),a=Date.parse(o.startedAt),s=Date.parse(o.finishedAt);if(o.date)o.date=i.format(o.date,"L");else{var u=d(o.startedAt);o.date=u.moment.format("L"),o.shift=u.no}if(t.details&&!s&&(s=Date.now()),o.shift=e("core","SHIFT:"+o.shift),o.startedAt=i.format(o.startedAt,"LTS"),o.finishedAt=i.format(o.finishedAt,"LTS"),o.duration=i.toString((s-a)/1e3,!t.details),o.creator=p(o.creator),t.orgUnits){var h=n.getByTypeAndId("subdivision",o.subdivision),f=n.getByTypeAndId("prodFlow",o.prodFlow);o.subdivision=h?h.getLabel():"?",o.prodFlow=f?f.getLabel():"?",o.mrpControllers=Array.isArray(o.mrpControllers)&&o.mrpControllers.length?o.mrpControllers.join(" "):""}if(o.prodShift=o.prodShift?'<a href="#prodShifts/'+o.prodShift+'">'+o.date+", "+o.shift+"</a>":o.date+", "+o.shift,o.orderData){var l=(o.orderData.operations||{})[o.operationNo]||{};o.productName=g(o.orderData),o.operationName=l.name||"",o.order=o.orderId,o.operation=o.operationNo,o.productName&&(o.order+=": "+o.productName),o.operationName&&(o.operation+=": "+o.operationName),o.product=o.productName,o.orderData.nc12&&o.orderData.nc12!==o.orderId&&(o.product=o.orderData.nc12+": "+o.product)}else o.productName="",o.operationName="",o.order=o.orderId,o.operation=o.operationNo;t.orderUrl&&r.isAllowedTo("ORDERS:VIEW")&&(o.orderUrl="#"+(o.mechOrder?"mechOrders":"orders")+"/"+encodeURIComponent(o.orderId)),o.taktTimeOk=this.isTaktTimeOk(),o.taktTimeSap=this.getTaktTime(),o.taktTime=this.getActualTaktTime(),o.taktTimeEff=this.getTaktTimeEfficiency(),o.workerCountSap=this.getWorkerCountSap(),o.efficiency="";var c=this.getEfficiency(t);return c?o.efficiency=Math.round(100*c)+"%":o.taktTimeEff&&(o.efficiency=o.taktTimeEff+"%"),o},serializeRow:function(t){var e=this.serialize(t);e.className=this.get("mechOrder")||!this.get("sapTaktTime")?"":e.taktTimeOk?"success":"warning";var r=this.get("mrpControllers")||[],i=this.get("orderData"),o=i&&i.mrp;return o&&-1===r.indexOf(o)?(e.mrpControllersText="+"+o+"\n-"+e.mrpControllers,e.mrpControllers=o+' <span style="text-decoration: line-through">'+e.mrpControllers+"</span>"):e.mrpControllersText=e.mrpControllers,e},serializeDetails:function(t){return this.serialize(Object.assign({orgUnits:!0,orderUrl:!0,details:!0},t))},onShiftChanged:function(){this.clear()},onOrderChanged:function(t,e,o,n){this.prepareOperations(e);var a=t.get("date"),s=i.getMoment().toDate();s<a&&(s=new Date(a.getTime())),this.set({prodShift:t.id,division:t.get("division"),subdivision:t.get("subdivision"),mrpControllers:t.get("mrpControllers"),prodFlow:t.get("prodFlow"),workCenter:t.get("workCenter"),prodLine:t.prodLine.id,date:a,shift:t.get("shift"),mechOrder:null===e.no,subdivisionType:t.getSubdivisionType(),orderId:e.no||e.nc12,operationNo:o,orderData:e,workerCount:n,totalQuantity:0,quantityDone:0,quantityLost:0,losses:null,creator:r.getInfo(),startedAt:s,finishedAt:null,master:t.get("master"),leader:t.get("leader"),operator:t.get("operator"),operators:t.get("operators"),spigot:null,sapTaktTime:null,lastTaktTime:null,avgTaktTime:null,totalQuantityDone:null}),this.set("sapTaktTime",this.getSapTaktTime()),this.generateId(t)},onOrderCorrected:function(t,e,i){var o=e.no||e.nc12;if(o===this.get("orderId")&&i===this.get("operationNo"))return null;this.prepareOperations(e);var n=this.get("spigot");n&&(n.forceCheck=!0);var a={mechOrder:null===e.no,orderId:o,operationNo:i,orderData:e,creator:r.getInfo()};return this.set(a),this.set("sapTaktTime",this.getSapTaktTime()),a.sapTaktTime=this.get("sapTaktTime"),this.get("workerCount")>this.getMaxWorkerCount()&&t.changeWorkerCount(0),this.get("quantityDone")>this.getMaxQuantityDone()&&t.changeQuantityDone(0),a},onOrderContinued:function(t){this.set({prodShift:t.id,division:t.get("division"),subdivision:t.get("subdivision"),mrpControllers:t.get("mrpControllers"),prodFlow:t.get("prodFlow"),workCenter:t.get("workCenter"),prodLine:t.prodLine.id,date:t.get("date"),shift:t.get("shift"),subdivisionType:t.getSubdivisionType(),workerCount:0,totalQuantity:0,quantityDone:0,quantityLost:0,losses:null,creator:r.getInfo(),startedAt:i.getMoment().toDate(),finishedAt:null,master:t.get("master"),leader:t.get("leader"),operator:t.get("operator"),operators:t.get("operators"),spigot:null,sapTaktTime:null,lastTaktTime:null,avgTaktTime:null,totalQuantityDone:null}),this.set("sapTaktTime",this.getSapTaktTime()),this.generateId(t)},generateId:function(t){this.set("_id",o.generateId(this.get("startedAt"),t.id+this.get("orderId")))},onWorkEnded:function(){this.clear()},isMechOrder:function(){return this.get("mechOrder")},getOrderNo:function(){var t=this.get("orderData");return t?t.no||"?":"-"},getNc12:function(){var t=this.get("orderData");return t?t.nc12||"?":"-"},getProductName:function(){var t=this.get("orderData");return t?g(t)||"?":"-"},getOperation:function(){var t=this.get("orderData"),e=this.get("operationNo");return t&&e&&t.operations&&t.operations[e]?t.operations[e]:null},getOperationName:function(){var t=this.getOperation(),e=this.get("operationNo");return(t?t.name:"")||e||"-"},getDurationString:function(t,e){var r=Date.parse(this.get("startedAt")),o=Date.parse(this.get("finishedAt"))||t||Date.now();return i.toString(Math.round((o-r)/1e3),e)},getEfficiencyClassName:function(t){var e=this.getEfficiency(t);return e>=1?"is-eff-high":e>=.9?"is-eff-mid":"is-eff-low"},getEfficiency:function(t){return this.constructor.getEfficiency(this.attributes,t)},getTaktTimeEfficiency:function(){var t=parseFloat(this.get("sapTaktTime")||this.getSapTaktTime())||0,e=parseFloat(this.getActualTaktTime())||0;return t&&e?Math.round(t/e*100):0},isTaktTimeOk:function(){return(Math.round(this.get("avgTaktTime")/1e3)||0)<=(this.get("sapTaktTime")||0)},getSapTaktTime:function(){var t=this.get("orderData"),e=this.get("operationNo");if(!t||!e)return 0;var r=t.operations?t.operations[e]:null;if(!r)return 0;var i=this.get("workerCount");if(i||(i=this.getWorkerCountSap()),"number"!=typeof i||0===i||r.laborTime<=0)return 0;var o=this.constructor.getTaktTimeCoeff(this.attributes);return Math.max(Math.round(r.laborTime*o/i*3600/100),1)},getIptTaktTime:function(){return Math.round((this.get("iptTaktTime")||0)/1e3)},getLastTaktTime:function(){return Math.round((this.get("lastTaktTime")||0)/1e3)},getAvgTaktTime:function(){return Math.round((this.get("avgTaktTime")||0)/1e3)},getTaktTime:function(){return this.get("orderData")&&this.get("operationNo")?this.getSapTaktTime()||"?":"-"},getActualTaktTime:function(){var t=this.getAvgTaktTime();if(t)return t;var e=i.getMoment(this.get("finishedAt"));if(!e.isValid())return"-";var r=e.diff(this.get("startedAt"),"seconds"),o=this.get("quantityDone");return o?Math.max(1,Math.round(r/o)):"?"},getWorkerCountSap:function(){var t=this.get("orderData"),e=this.get("operationNo");if(!t||!e)return"-";var r=t.operations?t.operations[e]:null;return!r||r.laborTime<=0||r.machineTime<=0?"?":Math.max(Math.round(r.laborTime/r.machineTime),1)},getWorkerCount:function(){return this.get("workerCount")||0},getWorkerCountForEdit:function(){var t=this.getWorkerCount();return 0!==t?t:"string"==typeof(t=this.getWorkerCountSap())||0===t?0:t},getMaxWorkerCount:function(){var t=this.getWorkerCountSap();return"number"!=typeof t||this.settings.isTaktTimeEnabled(this.get("prodLine"))?15:t+Math.max(1,Math.round(.25*t))},getMaxQuantityDone:function(){var t=this.get("orderData");return t&&t.qty&&!this.settings.isTaktTimeEnabled(this.get("prodLine"))?Math.ceil(1.25*t.qty):999},getStartedAt:function(){var t=this.get("startedAt");return t?i.format(t,"LTS"):"?"},getQuantityDone:function(){return this.get("quantityDone")||0},getSubdivisionType:function(){var t=n.getByTypeAndId("subdivision",this.get("subdivision"));return t?t.get("type"):null},getSpigotComponent:function(e,r){var i=this.get("orderData");if(t.isEmpty(e)||!i||!Array.isArray(i.bom))return null;e=e.split("\n").map(function(t){return new RegExp(t,"i")}),r=t.isEmpty(r)?[]:r.split("\n").map(function(t){return new RegExp(t,"i")});for(var o=i.bom,n=0;n<o.length;++n){var a=o[n];if(this.isValidSpigotComponent(a,e,r)){if(t.isEmpty(a.nc12)){var s=a.name.match(/([0-9]{12})/);if(!s)continue;a=t.assign({},a,{nc12:s[1]})}return a}}return null},isValidSpigotComponent:function(t,e,r){for(var i=0;i<r.length;++i)if(r[i].test(t.name))return!1;for(var o=0;o<e.length;++o)if(e[o].test(t.name))return!0;return!1},getSpigotInsertComponent:function(e){if(!e)return null;var r={};(e||"").split("\n").forEach(function(t){var e=t.split(":"),i=e[0].trim();e[1].split(", ").forEach(function(t){r[t.trim()]=i})});var i=this.getNc12(),o=r[i];return o?t.find(this.get("orderData").bom,function(t){return t.nc12===o}):null},getOrderIdType:function(){return"assembly"===this.getSubdivisionType()?"no":"nc12"},hasOrderData:function(){return!!this.get("orderId")&&!!this.get("operationNo")&&!!this.get("orderData")},isEditable:function(){return this.hasEnded()&&!this.isFromPressWorksheet()},hasEnded:function(){return null!=this.get("finishedAt")},isFromPressWorksheet:function(){return null!=this.get("pressWorksheet")},finish:function(){if(!this.id||this.hasEnded())return null;var t=i.getMoment().toDate(),e=u(this.get("date"),this.get("shift"));return t>e&&(t=e),this.set("finishedAt",t),{_id:this.id,finishedAt:t}},prepareOperations:function(e){if(Array.isArray(e.operations)){var r={};e.operations.forEach(function(t){""!==t.workCenter&&-1!==t.laborTime&&(r[t.no]=t)}),e.operations=r}else t.isObject(e.operations)||(e.operations={});return e}},{parse:function(t){return["date","startedAt","finishedAt","createdAt"].forEach(function(e){"string"==typeof t[e]&&(t[e]=new Date(t[e]))}),t},getEfficiency:function(t,e){var r=t.workDuration||e&&e.workDuration||0;if(!r&&e&&e.prodDowntimes){var i=Date.now(),o=Date.parse(t.startedAt),n=t.finishedAt?Date.parse(t.finishedAt):i;r=n-o,e.prodDowntimes.forEach(function(e){var o=e.get("prodShiftOrder"),n=o&&o._id||o;if(!t._id||t._id===n){var s=a.get(e.get("reason"));if(!s||"break"===s.get("type")){var d=Date.parse(e.get("startedAt")),u=e.get("finishedAt")?Date.parse(e.get("finishedAt")):i;r-=u-d}}}),r/=36e5}if(r<=0)return 0;var s=this.getTaktTimeCoeff(t),d=t.laborTime*s/100*t.quantityDone/(r*t.workerCount);return isNaN(d)||!isFinite(d)?0:d},getOperation:function(t){return t.orderData&&t.orderData.operations&&t.orderData.operations[t.operationNo]||null},getTaktTimeCoeff:function(t){return this.getWcTaktTimeCoeff(t.orderData&&t.orderData.taktTimeCoeff,this.getOperation(t))},getWcTaktTimeCoeff:function(t,e){return t&&e&&(t[e.workCenter+"/"+e.no]||t["*/"+e.no]||t[e.workCenter]||t["*"])||1}})});