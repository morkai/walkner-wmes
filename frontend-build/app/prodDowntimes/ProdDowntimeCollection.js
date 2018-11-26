define(["underscore","../time","../user","../data/prodLog","../core/Collection","../data/orgUnits","../orgUnits/util/limitOrgUnits","./ProdDowntime"],function(r,e,t,n,a,i,s,o){"use strict";var d={eq:!0,ne:!0,in:!0,nin:!0};return a.extend({model:o,rqlQuery:function(r){var n=[{name:"in",args:["status",["undecided","rejected"]]},{name:"ge",args:["startedAt",e.getMoment().subtract(2,"weeks").startOf("day").hours(6).valueOf()]}];t.isAllowedTo("PROD_DOWNTIMES:ALL")||s(n,{divisionType:"prod"});var a=t.data.aors;return Array.isArray(a)&&(1===a.length?n.push({name:"eq",args:["aor",a[0]]}):a.length>1&&n.push({name:"in",args:["aor",a]})),r.Query.fromObject({fields:{rid:1,aor:1,reason:1,mrpControllers:1,prodFlow:1,prodLine:1,status:1,startedAt:1,finishedAt:1,date:1,shift:1,pressWorksheet:1,changesCount:1,orderData:1},sort:{startedAt:-1},limit:-1,selector:{name:"and",args:n}})},findFirstUnfinished:function(){return this.find(function(r){return null==r.get("finishedAt")})},finish:function(){var r=this.findFirstUnfinished();return r?r.finish():null},addFromInfo:function(r,a){var i=r.get("date"),s=a.startedAt||e.getMoment().toDate();s<i&&(s=new Date(i.getTime()));var d=new o({division:r.get("division"),subdivision:r.get("subdivision"),mrpControllers:r.get("mrpControllers"),prodFlow:r.get("prodFlow"),workCenter:r.get("workCenter"),prodLine:r.prodLine.id,prodShift:r.id,prodShiftOrder:r.prodShiftOrder.id||null,date:i,shift:r.get("shift"),aor:a.aor,reason:a.reason,reasonComment:a.reasonComment,status:o.STATUS.UNDECIDED,startedAt:s,creator:t.getInfo(),master:r.get("master"),leader:r.get("leader"),operator:r.get("operator"),operators:r.get("operators"),mechOrder:r.prodShiftOrder.get("mechOrder"),orderId:r.prodShiftOrder.get("orderId"),operationNo:r.prodShiftOrder.get("operationNo"),auto:a.auto||null});d.set("_id",n.generateId(d.get("startedAt"),r.id+a.aor));for(var u=this.rqlQuery.limit<1?1/0:this.rqlQuery.limit;this.length>=u;)this.pop({silent:!0});return this.unshift(d),d},hasOrMatches:function(r){if(r._id&&this.get(r._id))return!0;return this.matchStatus(r)&&this.matchAor(r)&&this.matchReason(r)&&this.matchOrgUnit(r)&&this.matchProdShift(r)&&this.matchProdShiftOrder(r)},matchStatus:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return("eq"===r.name||"in"===r.name)&&"status"===r.args[0]});return!t||("eq"===t.name?e.status===t.args[1]:-1!==t.args[1].indexOf(e.status))},matchAor:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return"aor"===r.args[0]&&d[r.name]});return!t||("eq"===t.name?e.aor===t.args[1]:"ne"===t.name?e.aor!==t.args[1]:"in"===t.name?-1!==t.args[1].indexOf(e.aor):"nin"!==t.name||-1===t.args[1].indexOf(e.aor))},matchReason:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return"reason"===r.args[0]&&d[r.name]});return!t||("eq"===t.name?e.reason===t.args[1]:"ne"===t.name?e.reason!==t.args[1]:"in"===t.name?-1!==t.args[1].indexOf(e.reason):"nin"!==t.name||-1===t.args[1].indexOf(e.reason))},matchOrgUnit:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return i.TYPES[r.args[0]]&&d[r.name]});if(!t)return!0;var n=t.args[0],a=t.args[1],s=e[n];return"eq"===t.name?s===a:"ne"===t.name?s!==a:"in"===t.name?-1!==a.indexOf(s):"nin"!==t.name||-1===a.indexOf(s)},matchProdShift:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return"eq"===r.name&&"prodShift"===r.args[0]});return!t||e.prodShift===t.args[1]},matchProdShiftOrder:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return"eq"===r.name&&"prodShiftOrder"===r.args[0]});return!t||e.prodShiftOrder===t.args[1]},refresh:function(r){for(var e=this.toJSON(),t=(r=r.map(function(r){return o.parse(r)})).length?r[0].startedAt:Number.MAX_VALUE,n=e.length-1;n>=0;--n){var a=e[n];a.startedAt>t&&r.unshift(a)}for(;r.length>8;)r.pop();this.reset(r)}})});