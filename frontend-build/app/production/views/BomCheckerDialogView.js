// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/viewport","app/core/View","app/production/templates/bomChecker","app/production/templates/bomCheckerRow"],function(n,e,o,t,s,a){"use strict";return t.extend({snManagerMode:"bom",template:s,dialogClassName:"production-modal production-bomChecker-modal",events:{"click .production-bomChecker-reset":function(n){return this.updateComponent(this.components[this.$(n.target).closest("tr").attr("data-id")],"todo"),!1}},initialize:function(){var n=this.model.orderData,o=this.model.logEntry.data;this.components=[{_id:0,status:o.serialNo?"success":"todo",nc12:n.no,description:n.description,single:!0,unique:!0,patternInfo:{pattern:/\.([0-9]{9})\.([0-9]{4})/,nc12:[1],sn:[2]},scanInfo:{raw:o.serialNo?o._id:"?",nc12:n.no,sn:o.serialNo},icon:o.serialNo?"fa-thumbs-up":"fa-question",message:e("production","bomChecker:message:"+(o.serialNo?"success":"todo")+":sn")}].concat(this.model.components.map(function(n,o){return{_id:o+1,status:"todo",nc12:n.nc12,description:n.description,single:n.single,unique:n.unique,patternInfo:{pattern:new RegExp(n.pattern),nc12:n.nc12Index,sn:n.snIndex},scanInfo:{raw:"?",nc12:"",sn:""},icon:"fa-question",message:e("production","bomChecker:message:todo")}}))},afterRender:function(){var n=this,e=[];n.components.forEach(function(o){e.push(n.renderPartial(a,{component:o}))}),n.$id("components").append(e)},onSnScanned:function(n){for(var e=n._id,o=0;o<this.components.length;++o){var t=this.components[o],s=e.match(t.patternInfo.pattern);if(s){if(!t.single){if(t.scanInfo.raw===e)return this.updateComponent(t,"todo");if("success"===t.status||"checking"===t.status)continue}return t.scanInfo.raw=e,0===t._id?(t.scanInfo.nc12=n.orderNo,t.scanInfo.sn=n.serialNo):(t.scanInfo.nc12=t.nc12,t.scanInfo.sn="",t.patternInfo.nc12.forEach(function(n){s[n]&&(t.scanInfo.nc12=s[n])}),t.patternInfo.sn.forEach(function(n){s[n]&&(t.scanInfo.sn=s[n])})),this.handleComponent(t)}}this.snMessage.show(n,"error","BOM_CHECKER:NO_MATCH")},handleComponent:function(n){function o(){t.updateComponent(n,"success"),clearTimeout(t.timers.checkAll),t.timers.checkAll=setTimeout(t.checkAll.bind(t),333)}var t=this;if(n.scanInfo.nc12!==n.nc12)return t.updateComponent(n,"failure",e("production","bomChecker:message:nc12",{nc12:n.nc12}));if(n.unique){t.updateComponent(n,"checking");var s=t.ajax({method:"POST",url:"/production/checkAnySerialNumber",data:JSON.stringify({sn:0===n._id?n.scanInfo.raw:n.scanInfo.nc12+":"+n.scanInfo.sn}),timeout:6e3});s.fail(function(){t.updateComponent(n,"failure")}),s.done(function(s){s?t.updateComponent(n,"failure",e("production","bomChecker:message:used"+(0===n._id?":sn":""),{psn:s})):o()})}else o()},checkAll:function(){if(!this.components.filter(function(n){return"success"!==n.status}).length){var n=this.model.logEntry.data;n.scannedAt=(new Date).toISOString(),n.bom=[],this.components.forEach(function(e){0===e._id?(n.orderNo=e.scanInfo.nc12,n.serialNo=e.scanInfo.sn):n.bom.push(e.scanInfo.nc12+":"+e.scanInfo.sn)}),this.trigger("checked",this.model.logEntry)}},updateComponent:function(n,o,t){switch(o&&(n.status=o),n.status){case"checking":n.icon="fa-spinner fa-spin";break;case"failure":n.icon="fa-thumbs-down";break;case"success":n.icon="fa-thumbs-up";break;case"todo":n.icon="fa-question",n.scanInfo.raw="?"}n.message=t||e("production","bomChecker:message:"+n.status+(0===n._id?":sn":"")),0===n._id&&(this.model.logEntry.data._id=n.scanInfo.raw,this.model.logEntry.data.serialNo=n.scanInfo.sn),this.$('tr[data-id="'+n._id+'"]').replaceWith(this.renderPartial(a,{component:n}))}})});