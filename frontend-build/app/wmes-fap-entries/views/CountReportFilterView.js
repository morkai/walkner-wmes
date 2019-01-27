define(["js2form","app/time","app/core/View","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/util/forms/dateTimeRange","app/mrpControllers/util/setUpMrpSelect2","app/data/orgUnits","../dictionaries","app/wmes-fap-entries/templates/countReportFilter","app/core/util/ExpandableSelect"],function(e,t,i,a,r,o,n,s,l,p){"use strict";return i.extend({template:p,events:{"click a[data-date-time-range]":o.handleRangeEvent,submit:function(){return this.changeFilter(),!1}},destroy:function(){this.$(".is-expandable").expandableSelect("destroy")},afterRender:function(){e(this.el,this.serializeFormData()),a.toggle(this.$id("interval")),this.$(".is-expandable").expandableSelect(),this.$id("categories").select2({width:"350px",allowClear:!0,multiple:!0,data:l.categories.map(r)}),n(this.$id("mrps"),{own:!0,view:this,width:"250px"})},getTemplateData:function(){return{divisions:s.getAllByType("division").filter(function(e){return e.isActive()&&"prod"===e.get("type")}).map(r)}},serializeFormData:function(){var e=this.model,i=+e.get("from"),a=+e.get("to");return{interval:e.get("interval"),"from-date":i?t.format(i,"YYYY-MM-DD"):"","to-date":a?t.format(a,"YYYY-MM-DD"):"",categories:e.get("categories").join(","),mrps:e.get("mrps").join(","),divisions:e.get("divisions").join(",")}},changeFilter:function(){var e=this,t=o.serialize(e),i={from:t.from?t.from.valueOf():0,to:t.to?t.to.valueOf():0,interval:a.getValue(this.$id("interval"))};["categories","mrps","divisions"].forEach(function(t){var a=e.$id(t).val();i[t]=Array.isArray(a)?a:a?a.split(","):[]}),e.model.set(i),e.model.trigger("filtered")}})});