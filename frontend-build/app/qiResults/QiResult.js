// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../user","../i18n","../core/Model","app/core/templates/userInfo"],function(e,t,i,r,o,n){"use strict";function s(i,r){return e.map(r,function(e){return{status:i.getLabel("actionStatus",e.status),when:t.format(e.when,"LL"),who:e.who.map(function(e){return e.label}).join(", "),what:e.what.trim()}})}var a={"application/octet-stream":"file-archive-o","application/x-zip-compressed":"file-archive-o","application/x-7z-compressed":"file-archive-o","application/x-rar-compressed":"file-archive-o","application/pdf":"file-pdf-o","application/json":"file-text-o","application/msword":"file-word-o","application/vnd.openxmlformats-officedocument.wordprocessingml.document":"file-word-o","application/vnd.ms-excel":"file-excel-o","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"file-excel-o","application/vnd.ms-powerpoint":"file-powerpoint-o","application/vnd.openxmlformats-officedocument.presentationml.presentation":"file-powerpoint-o"};return o.extend({urlRoot:"/qi/results",clientUrlRoot:"#qi/results",topicPrefix:"qi.results",privilegePrefix:"QI:RESULTS",nlsDomain:"qiResults",labelAttribute:"rid",canEdit:function(){if(i.isAllowedTo("QI:RESULTS:MANAGE"))return!0;var e=this.attributes,t=Date.parse(e.updatedAt||e.createdAt);return!(Date.now()-t>12096e5)&&(e.ok?this.isInspector():i.isAllowedTo("QI:SPECIALIST")||this.isInspector()||this.isNokOwner()||this.isLeader()||this.isCorrector())},canDelete:function(){if(i.isAllowedTo("QI:RESULTS:MANAGE"))return!0;var e=this.attributes,t=Date.parse(e.updatedAt||e.createdAt);return!(Date.now()-t>864e5)&&(this.isInspector()||this.isCreator())},canEditAttachments:function(e){return e?i.isAllowedTo("QI:RESULTS:MANAGE")||this.isInspector():i.isAllowedTo("QI:INSPECTOR","QI:RESULTS:MANAGE")},canAddActions:function(){return i.isAllowedTo("QI:SPECIALIST","QI:RESULTS:MANAGE")||this.isNokOwner()},canEditActions:function(e){return e?i.isAllowedTo("QI:SPECIALIST","QI:RESULTS:MANAGE")||this.isNokOwner()||this.isLeader()||this.isCorrector():i.isAllowedTo("QI:SPECIALIST","QI:RESULTS:MANAGE")},isCreator:function(){return!!this.attributes.creator&&this.attributes.creator.id===i.data._id},isInspector:function(){return!!this.attributes.inspector&&this.attributes.inspector.id===i.data._id},isNokOwner:function(){return!!this.attributes.nokOwner&&this.attributes.nokOwner.id===i.data._id},isLeader:function(){return!!this.attributes.leader&&this.attributes.leader.id===i.data._id},isCorrector:function(){var t=this.attributes;return!!t.users&&e.size(t.correctiveActions)>0&&t.users.indexOf(i.data._id)!==-1&&e.some(t.correctiveActions,function(t){return e.some(t.who,function(e){return e.id===i.data._id})})},serialize:function(e,i){var r=this.toJSON();return r.createdAt=t.format(r.createdAt,"LLLL"),r.creator=n({userInfo:r.creator}),r.updatedAt=t.format(r.updatedAt,"LLLL"),r.updater=n({userInfo:r.updater}),r.inspectedAt=t.format(r.inspectedAt,i.dateFormat||"L"),r.inspector=n({userInfo:r.inspector}),r.nokOwner=n({userInfo:r.nokOwner}),r.leader=n({userInfo:r.leader}),r.kind=e.getLabel("kind",r.kind),r.qtyOrder=r.qtyOrder?r.qtyOrder.toLocaleString():"0",r.qtyInspected=r.qtyInspected.toLocaleString(),r.serialNumbers=Array.isArray(r.serialNumbers)?r.serialNumbers.join(", "):"",r.ok?(r.errorCategory="",r.faultCode="",r.qtyToFix="",r.qtyNok="",r.qtyNokInspected=""):(r.errorCategory=e.getLabel("errorCategory",r.errorCategory),r.qtyToFix=r.qtyToFix.toLocaleString(),r.qtyNok=r.qtyNok.toLocaleString(),r.qtyNokInspected=r.qtyNokInspected>=0?r.qtyNokInspected.toLocaleString():"",r.correctiveActions=this.serializeCorrectiveActions(e)),r},serializeRow:function(e,i){var r=this.serialize(e,i);return r.className=r.ok?"success":"danger",!r.ok&&r.correctiveActions.length&&(r.correctiveAction=this.serializeBestCorrectiveAction(e,i&&i.today||t.getMoment().startOf("day").hours(6).valueOf())),r},serializeDetails:function(e){var t=this.serialize(e,{dateFormat:"LL"});return t.okFile=this.serializeFile(t.okFile),t.nokFile=this.serializeFile(t.nokFile),t},serializeCorrectiveActions:function(e){return s(e,this.get("correctiveActions"))},serializeBestCorrectiveAction:function(e,i){var r,o=this.get("correctiveActions");if(0===o.length)return"";if(1===o.length)r=o[0];else{var n=o.map(function(e){var t=Date.parse(e.when)-i;return{diff:t<0?Number.MAX_VALUE:t,action:e}}).sort(function(e,t){return e.diff-t.diff});for(r=n[0].action;n.length;){var s=n.shift().action;if("finished"!==s.status){r=s;break}}}var a=e.getLabel("actionStatus",r.status);return r.when&&(a+=", "+t.format(r.when,"L")),o.length>1&&(a+=" +"+(o.length-1)),a},serializeFile:function(e){if(!e)return null;var t=e.type.split("/");switch(t[0]){case"image":case"video":case"audio":case"text":e.icon="file-"+t[0]+"-o";break;case"multipart":e.icon="file-archive-o";break;default:e.icon=a[e.type]||"file-o"}return e}},{serializeCorrectiveActions:s})});