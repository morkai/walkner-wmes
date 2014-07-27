// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../time","../core/Model","../core/util/getShiftEndDate","./util/decorateProdDowntime"],function(e,t,n,l){var r={undecided:"warning",confirmed:"success",rejected:"danger"};return t.extend({urlRoot:"/prodDowntimes",clientUrlRoot:"#prodDowntimes",topicPrefix:"prodDowntimes",privilegePrefix:"PROD_DOWNTIMES",nlsDomain:"prodDowntimes",labelAttribute:"rid",defaults:{division:null,subdivision:null,mrpControllers:null,prodFlow:null,workCenter:null,prodLine:null,prodShift:null,prodShiftOrder:null,date:null,shift:null,aor:null,reason:null,reasonComment:null,decisionComment:null,status:null,startedAt:null,finishedAt:null,corroborator:null,corroboratedAt:null,creator:null,master:null,leader:null,operator:null,operators:null,mechOrder:null,orderId:null,operationNo:null},serialize:function(){return l(this)},getCssClassName:function(){return r[this.get("status")]},finish:function(){if(null!=this.get("finishedAt"))return null;var t=e.getMoment().toDate(),l=n(this.get("date"),this.get("shift"));return t>l&&(t=l),this.set("finishedAt",t),{_id:this.id,finishedAt:t}},isEditable:function(){return null!=this.get("finishedAt")&&null===this.get("pressWorksheet")}},{STATUS:{UNDECIDED:"undecided",CONFIRMED:"confirmed",REJECTED:"rejected"}})});