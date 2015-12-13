// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../time","../user","../data/prodLog","../core/Collection","./ProdDowntime"],function(r,e,t,n,a,i){"use strict";var s={eq:!0,ne:!0,"in":!0,nin:!0};return a.extend({model:i,rqlQuery:function(r){var n=[{name:"in",args:["status",["undecided","rejected"]]},{name:"ge",args:["startedAt",e.getMoment().subtract(1,"week").startOf("day").hours(6).valueOf()]}];if(!t.isAllowedTo("PROD_DOWNTIMES:ALL")){var a=t.getSubdivision();if(a)n.push({name:"eq",args:["subdivision",a.id]});else{var i=t.getDivision();i&&n.push({name:"eq",args:["division",i.id]})}}return Array.isArray(t.data.aors)&&(1===t.data.aors.length?n.push({name:"eq",args:["aor",t.data.aors[0]]}):t.data.aors.length>1&&n.push({name:"in",args:["aor",t.data.aors]})),r.Query.fromObject({fields:{rid:1,aor:1,reason:1,mrpControllers:1,prodFlow:1,prodLine:1,status:1,startedAt:1,finishedAt:1,date:1,shift:1,pressWorksheet:1,changesCount:1},sort:{startedAt:-1},limit:15,selector:{name:"and",args:n}})},findFirstUnfinished:function(){return this.find(function(r){return null==r.get("finishedAt")})},finish:function(){var r=this.findFirstUnfinished();return r?r.finish():null},addFromInfo:function(r,a){var s=new i({division:r.get("division"),subdivision:r.get("subdivision"),mrpControllers:r.get("mrpControllers"),prodFlow:r.get("prodFlow"),workCenter:r.get("workCenter"),prodLine:r.prodLine.id,prodShift:r.id,prodShiftOrder:r.prodShiftOrder.id||null,date:r.get("date"),shift:r.get("shift"),aor:a.aor,reason:a.reason,reasonComment:a.reasonComment,status:i.STATUS.UNDECIDED,startedAt:a.startedAt||e.getMoment().toDate(),creator:t.getInfo(),master:r.get("master"),leader:r.get("leader"),operator:r.get("operator"),operators:r.get("operators"),mechOrder:r.prodShiftOrder.get("mechOrder"),orderId:r.prodShiftOrder.get("orderId"),operationNo:r.prodShiftOrder.get("operationNo")});s.set("_id",n.generateId(s.get("startedAt"),r.id+a.aor));for(var o=this.rqlQuery.limit<1?1/0:this.rqlQuery.limit;this.length>=o;)this.pop({silent:!0});return this.unshift(s),s},hasOrMatches:function(r){if(r._id){var e=this.get(r._id);if(e)return!0}return this.matchStatus(r)&&this.matchAor(r)&&this.matchReason(r)&&this.matchOrgUnit(r)},matchStatus:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return("eq"===r.name||"in"===r.name)&&"status"===r.args[0]});return t?"eq"===t.name?e.status===t.args[1]:-1!==t.args[1].indexOf(e.status):!0},matchAor:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return"aor"===r.args[0]&&s[r.name]});return t?"eq"===t.name?e.aor===t.args[1]:"ne"===t.name?e.aor!==t.args[1]:"in"===t.name?-1!==t.args[1].indexOf(e.aor):"nin"===t.name?-1===t.args[1].indexOf(e.aor):!0:!0},matchReason:function(e){var t=r.find(this.rqlQuery.selector.args,function(r){return"reason"===r.args[0]&&s[r.name]});return t?"eq"===t.name?e.reason===t.args[1]:"ne"===t.name?e.reason!==t.args[1]:"in"===t.name?-1!==t.args[1].indexOf(e.reason):"nin"===t.name?-1===t.args[1].indexOf(e.reason):!0:!0},matchOrgUnit:function(r){return!0}})});