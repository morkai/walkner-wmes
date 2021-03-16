define(["underscore","../time","../user","../i18n","../core/Model","app/core/templates/userInfo"],function(e,t,r,i,o,a){"use strict";var n={"application/octet-stream":"file-archive-o","application/x-zip-compressed":"file-archive-o","application/x-7z-compressed":"file-archive-o","application/x-rar-compressed":"file-archive-o","application/pdf":"file-pdf-o","application/json":"file-text-o","application/msword":"file-word-o","application/vnd.openxmlformats-officedocument.wordprocessingml.document":"file-word-o","application/vnd.ms-excel":"file-excel-o","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"file-excel-o","application/vnd.ms-powerpoint":"file-powerpoint-o","application/vnd.openxmlformats-officedocument.presentationml.presentation":"file-powerpoint-o"};function s(r,i){return e.map(i,function(e){return{status:r?r.getLabel("actionStatus",e.status):e.status,when:t.format(e.when,"LL"),who:e.who.map(function(e){return e.label}).join(", "),what:e.what.trim()}})}return o.extend({urlRoot:"/qi/results",clientUrlRoot:"#qi/results",topicPrefix:"qi.results",privilegePrefix:"QI:RESULTS",nlsDomain:"qiResults",labelAttribute:"rid",canEdit:function(){if(r.isAllowedTo("QI:RESULTS:MANAGE"))return!0;var e=this.attributes,t=Date.parse(e.updatedAt||e.createdAt);return!(Date.now()-t>12096e5)&&(e.ok?this.isInspector()||this.isCreator():r.isAllowedTo("QI:SPECIALIST","FN:master","FN:leader","FN:prod_whman")||this.isInspector()||this.isNokOwner()||this.isLeader()||this.isCorrector())},canDelete:function(){if(r.isAllowedTo("QI:RESULTS:MANAGE"))return!0;var e=this.attributes,t=Date.parse(e.updatedAt||e.createdAt);return!(Date.now()-t>864e5)&&(this.isInspector()||this.isCreator())},canEditAttachments:function(e){return e?r.isAllowedTo("QI:RESULTS:MANAGE")||this.isInspector()||this.isLeader():r.isAllowedTo("QI:INSPECTOR","QI:RESULTS:MANAGE")},canAddActions:function(){return r.isAllowedTo("QI:SPECIALIST","QI:RESULTS:MANAGE")||this.isNokOwner()||this.isLeader()},canEditActions:function(e){return e?r.isAllowedTo("QI:SPECIALIST","QI:RESULTS:MANAGE","FN:master","FN:leader","FN:prod_whman")||this.isNokOwner()||this.isLeader()||this.isCorrector():r.isAllowedTo("QI:SPECIALIST","QI:RESULTS:MANAGE")},isCreator:function(){return!!this.attributes.creator&&this.attributes.creator.id===r.data._id},isInspector:function(){return!!this.attributes.inspector&&this.attributes.inspector.id===r.data._id},isNokOwner:function(){return!!this.attributes.nokOwner&&this.attributes.nokOwner.id===r.data._id},isLeader:function(){return!!this.attributes.leader&&this.attributes.leader.id===r.data._id},isCorrector:function(){var t=this.attributes;return!!t.users&&e.size(t.correctiveActions)>0&&-1!==t.users.indexOf(r.data._id)&&e.some(t.correctiveActions,function(t){return e.some(t.who,function(e){return e.id===r.data._id})})},serialize:function(e,r){var i=this.toJSON();return i.createdAt=t.format(i.createdAt,"LLLL"),i.creator=a(i.creator),i.updatedAt=t.format(i.updatedAt,"LLLL"),i.updater=a(i.updater),i.inspectedAtTime=Date.parse(i.inspectedAt),i.inspectedAt=t.format(i.inspectedAtTime,r&&r.dateFormat||"L"),i.inspector=a(i.inspector),i.nokOwner=a(i.nokOwner),i.leader=a(i.leader),i.coach=a(i.coach),i.operator=a(i.operator),i.kind=e?e.getLabel("kind",i.kind):i.kind,i.qtyOrder=i.qtyOrder?i.qtyOrder.toLocaleString():"0",i.qtyInspected=i.qtyInspected.toLocaleString(),i.serialNumbers=Array.isArray(i.serialNumbers)?i.serialNumbers.join(", "):"",i.ok?(i.errorCategory="",i.faultCode="",i.qtyToFix="",i.qtyNok="",i.qtyNokInspected=""):(i.errorCategory=e&&e.getLabel("errorCategory",i.errorCategory)||i.errorCategory,i.qtyToFix=i.qtyToFix.toLocaleString(),i.qtyNok=i.qtyNok.toLocaleString(),i.qtyNokInspected=i.qtyNokInspected>=0?i.qtyNokInspected.toLocaleString():"",i.correctiveActions=this.serializeCorrectiveActions(e)),"wh"===i.source?(i.orderNo="",i.mrp="",i.productFamily=""):"000000000"===i.orderNo&&(i.orderNo="",i.mrp="",i.nc12="",i.productFamily="",i.productName=""),i},serializeRow:function(e,r){var i=this.serialize(e,r);return i.className=i.ok?"success":"danger",!i.ok&&i.correctiveActions.length&&(i.correctiveAction=this.serializeBestCorrectiveAction(e,r&&r.today||t.getMoment().startOf("day").hours(6).valueOf())),i.inspectorLeader=i.inspector||i.leader,i},serializeDetails:function(e){var t=this.serialize(e,{dateFormat:"LL"});return t.okFile=this.serializeFile(t.okFile),t.nokFile=this.serializeFile(t.nokFile),t},serializeCorrectiveActions:function(e){return s(e,this.get("correctiveActions"))},serializeBestCorrectiveAction:function(e,r){var i,o=this.get("correctiveActions");if(0===o.length)return"";if(1===o.length)i=o[0];else{var a=o.map(function(e){var t=Date.parse(e.when)-r;return{diff:t<0?Number.MAX_VALUE:t,action:e}}).sort(function(e,t){return e.diff-t.diff});for(i=a[0].action;a.length;){var n=a.shift().action;if("finished"!==n.status){i=n;break}}}var s=e?e.getLabel("actionStatus",i.status):i.status;return i.when&&(s+=", "+t.format(i.when,"L")),o.length>1&&(s+=" +"+(o.length-1)),s},serializeFile:function(e){if(!e)return null;var t=e.type.split("/");switch(t[0]){case"image":case"video":case"audio":case"text":e.icon="file-"+t[0]+"-o";break;case"multipart":e.icon="file-archive-o";break;default:e.icon=n[e.type]||"file-o"}return e}},{serializeCorrectiveActions:s})});