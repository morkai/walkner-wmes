define(["underscore","js2form","app/time","app/core/View","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/util/forms/dateTimeRange","app/kaizenOrders/dictionaries","app/suggestions/templates/engagement/filter","app/core/util/ExpandableSelect"],function(e,t,i,a,s,n,r,o,l){"use strict";return a.extend({template:l,events:{"click a[data-date-time-range]":r.handleRangeEvent,submit:function(){return this.changeFilter(),!1}},destroy:function(){this.$(".is-expandable").expandableSelect("destroy")},getTemplateData:function(){return{statuses:["new","accepted","todo","inProgress","verification","paused","finished","cancelled"]}},afterRender:function(){t(this.el,this.serializeFormData()),s.toggle(this.$id("interval")),this.$id("sections").select2({width:"350px",allowClear:!0,multiple:!0,data:o.sections.map(n)}),this.$(".is-expandable").expandableSelect()},serializeFormData:function(){var e=this.model,t=+e.get("from"),a=+e.get("to");return{interval:e.get("interval"),"from-date":t?i.format(t,"YYYY-MM-DD"):"","to-date":a?i.format(a,"YYYY-MM-DD"):"",status:e.get("status").join(","),sections:e.get("sections").join(",")}},changeFilter:function(){var e=r.serialize(this),t={from:e.from?e.from.valueOf():0,to:e.to?e.to.valueOf():0,interval:s.getValue(this.$id("interval")),status:this.$id("status").val()||[],sections:this.$id("sections").val()};t.sections=""===t.sections?[]:t.sections.split(","),this.model.set(t),this.model.trigger("filtered")}})});