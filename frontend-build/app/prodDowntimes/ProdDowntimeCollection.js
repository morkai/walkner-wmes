// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../user","../data/prodLog","../core/Collection","./ProdDowntime"],function(r,e,t,n,a,s){"use strict";var i={eq:!0,ne:!0,in:!0,nin:!0};return a.extend({model:s,rqlQuery:function(r){var n=[{name:"in",args:["status",["undecided","rejected"]]},{name:"ge",args:["startedAt",e.getMoment().subtract(1,"week").startOf("day").hours(6).valueOf()]}];if(!t.isAllowedTo("PROD_DOWNTIMES:ALL")){var a=t.getSubdivision();if(a)n.push({name:"eq",args:["subdivision",a.id]});else{var s=t.getDivision();s&&n.push({name:"eq",args:["division",s.id]})}}return Array.isArray(t.data.aors)&&(1===t.data.aors.length?n.push({name:"eq",args:["aor",t.data.aors[0]]}):t.data.aors.length>1&&n.push({name:"in",args:["aor",t.data.aors]})),r.Query.fromObject({fields:{rid:1,aor:1,reason:1,mrpControllers:1,prodFlow:1,prodLine:1,status:1,startedAt:1,finishedAt:1,date:1,shift:1,pressWorksheet:1,changesCount:1,orderData:1},sort:{startedAt:-1},limit:20,selector:{name:"and",args:n}})},findFirstUnfinished:function(){return this.find(function(r){return null==r.get("finishedAt")})},finish:function(){var r=this.findFirstUnfinished();return r?r.finish():null},addFromInfo:function(r,a){var i=r.get("date"),o=a.startedAt||e.getMoment().toDate();o<i&&(o=new Date(i.getTime()));var d=new s({division:r.get("division"),subdivision:r.get("subdivision"),mrpControllers:r.get("mrpControllers"),prodFlow:r.get("prodFlow"),workCenter:r.get("workCenter"),prodLine:r.prodLine.id,prodShift:r.id,prodShiftOrder:r.prodShiftOrder.id||null,date:i,shift:r.get("shift"),aor:a.aor,reason:a.reason,reasonComment:a.reasonComment,status:s.STATUS.UNDECIDED,startedAt:o,creator:t.getInfo(),master:r.get("master"),leader:r.get("leader"),operator:r.get("operator"),operators:r.get("operators"),mechOrder:r.prodShiftOrder.get("mechOrder"),orderId:r.prodShiftOrder.get("orderId"),operationNo:r.prodShiftOrder.get("operationNo"),auto:a.auto||null});d.set("_id",n.generateId(d.get("startedAt"),r.id+a.aor));for(var u=this.rqlQuery.limit<1?1/0:this.rqlQuery.limit;this.length>=u;)this.pop({silent:!0});return this.unshift(d),d},hasOrMatches:function(r){if(r._id){var e=this.get(r._id);if(e)return!0}return this.matchStatus(r)&&this.matchAor(r)&&this.matchReason(r)&&this.matchOrgUnit(r)},matchStatus:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return("eq"===r.name||"in"===r.name)&&"status"===r.args[0]});return!t||("eq"===t.name?e.status===t.args[1]:t.args[1].indexOf(e.status)!==-1)},matchAor:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return"aor"===r.args[0]&&i[r.name]});return!t||("eq"===t.name?e.aor===t.args[1]:"ne"===t.name?e.aor!==t.args[1]:"in"===t.name?t.args[1].indexOf(e.aor)!==-1:"nin"!==t.name||t.args[1].indexOf(e.aor)===-1)},matchReason:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return"reason"===r.args[0]&&i[r.name]});return!t||("eq"===t.name?e.reason===t.args[1]:"ne"===t.name?e.reason!==t.args[1]:"in"===t.name?t.args[1].indexOf(e.reason)!==-1:"nin"!==t.name||t.args[1].indexOf(e.reason)===-1)},matchOrgUnit:function(r){return!0},refresh:function(r){var e=this.toJSON();r=r.map(function(r){return s.parse(r)});for(var t=r.length?r[0].startedAt:Number.MAX_VALUE,n=e.length-1;n>=0;--n){var a=e[n];a.startedAt>t&&r.unshift(a)}for(;r.length>8;)r.pop();this.reset(r)}})});