// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../time","../user","../core/Model","../core/util/getShiftEndDate","../data/aors","../data/downtimeReasons","./util/decorateProdDowntime"],function(t,e,n,r,i,o,s){"use strict";var a={undecided:"warning",confirmed:"success",rejected:"danger","null":"primary"};return n.extend({urlRoot:"/prodDowntimes",clientUrlRoot:"#prodDowntimes",topicPrefix:"prodDowntimes",privilegePrefix:"PROD_DOWNTIMES",nlsDomain:"prodDowntimes",labelAttribute:"rid",defaults:{division:null,subdivision:null,mrpControllers:null,prodFlow:null,workCenter:null,prodLine:null,prodShift:null,prodShiftOrder:null,date:null,shift:null,aor:null,reason:null,reasonComment:null,decisionComment:null,status:null,startedAt:null,finishedAt:null,corroborator:null,corroboratedAt:null,creator:null,master:null,leader:null,operator:null,operators:null,mechOrder:null,orderId:null,operationNo:null},url:function(){var t=n.prototype.url.apply(this,arguments);return this.isNew()?t:t+"?populate(prodShiftOrder)"},serializeRow:function(t){return s(this,{changesCount:!0,currentTime:t})},serializeDetails:function(){return s(this,{longDate:!0})},getReasonLabel:function(){var t=this.get("reason"),e=o.get(t);return e?e.get("label"):t},getAorLabel:function(){var t=this.get("aor"),e=i.get(t);return e?e.get("name"):t},getCssClassName:function(t){return a[void 0===t?this.get("status"):t]},finish:function(){if(null!=this.get("finishedAt"))return null;var e=t.getMoment().toDate(),n=r(this.get("date"),this.get("shift"));return e>n&&(e=n),this.set("finishedAt",e),{_id:this.id,finishedAt:e}},isEditable:function(){return null!=this.get("finishedAt")&&null===this.get("pressWorksheet")},canCorroborate:function(){return e.isLoggedIn()&&null===this.get("pressWorksheet")},canChangeStatus:function(t){if(!this.get("finishedAt"))return 0;if(t.canManageProdData)return 2;var e=this.get("status");if(!t.canManageProdDowntimes||"confirmed"===e)return 0;var n=this.get("changesCount");return!n||n.rejected>=t.maxRejectedChanges||n.reason>=t.maxReasonChanges||n.aor>=t.maxAorChanges?0:t.hasAccessToAor(this.get("aor"))?1:0},getDurationString:function(e,n){var r=Date.parse(this.get("startedAt")),i=Date.parse(this.get("finishedAt"))||e||Date.now();return t.toString(Math.round((i-r)/1e3),n)}},{STATUS:{UNDECIDED:"undecided",CONFIRMED:"confirmed",REJECTED:"rejected"},parse:function(t){return["date","startedAt","finishedAt","createdAt","corroboratedAt"].forEach(function(e){"string"==typeof t[e]&&(t[e]=new Date(t[e]))}),t}})});