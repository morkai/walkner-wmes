define(["js2form","app/time","app/core/View","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/util/forms/dateTimeRange","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","app/minutesForSafetyCards/templates/countReportFilter"],function(e,t,i,r,a,s,o,n,l){"use strict";return i.extend({template:l,events:{"click a[data-date-time-range]":s.handleRangeEvent,submit:function(){return this.changeFilter(),!1}},afterRender:function(){e(this.el,this.serializeFormData()),r.toggle(this.$id("interval")),this.$id("sections").select2({width:"350px",allowClear:!0,multiple:!0,data:n.sections.map(a)}),o(this.$id("owner"),{width:"300px",view:this})},serializeFormData:function(){var e=this.model,i=+e.get("from"),r=+e.get("to");return{interval:e.get("interval"),"from-date":i?t.format(i,"YYYY-MM-DD"):"","to-date":r?t.format(r,"YYYY-MM-DD"):"",sections:e.get("sections").join(","),owner:e.get("owner")}},changeFilter:function(){var e=s.serialize(this),t={from:e.from?e.from.valueOf():0,to:e.to?e.to.valueOf():0,interval:r.getValue(this.$id("interval")),sections:this.$id("sections").val(),owner:this.$id("owner").val()};t.sections=""===t.sections?[]:t.sections.split(","),this.model.set(t),this.model.trigger("filtered")}})});