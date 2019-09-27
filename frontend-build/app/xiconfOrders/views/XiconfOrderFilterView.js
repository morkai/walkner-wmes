define(["underscore","app/time","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/xiconfOrders/templates/filter"],function(e,t,a,r,n){"use strict";return a.extend({template:n,events:e.assign({"click a[data-date-time-range]":r.handleRangeEvent},a.prototype.events),defaultFormData:function(){return{_id:"",nc12:"",status:[-1,0,1]}},termToForm:{reqDate:r.rqlToForm,_id:function(e,t,a){a._id=t.args[1].replace(/[^0-9]/g,"")},status:function(e,t,a){a.status="eq"===t.name?[t.args[1]]:t.args[1]},nc12:function(e,t,a){a.nc12=t.args[1].replace(/[^0-9A-Za-z]/g,"")}},afterRender:function(){a.prototype.afterRender.call(this),this.toggleButtonGroup("status")},serializeFormToQuery:function(e){var t=this.getButtonGroupValue("status").map(Number);r.formToRql(this,e),this.serializeRegexTerm(e,"_id",9,null,!1,!0),this.serializeRegexTerm(e,"nc12",12,null,!1,!0),1===t.length?e.push({name:"eq",args:["status",t[0]]}):2===t.length&&e.push({name:"in",args:["status",t]})}})});