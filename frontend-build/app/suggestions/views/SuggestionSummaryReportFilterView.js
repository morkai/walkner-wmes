define(["js2form","app/time","app/core/View","app/core/util/idAndLabel","app/core/util/forms/dateTimeRange","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","app/suggestions/templates/summaryReportFilter"],function(t,e,i,r,a,o,s,n){"use strict";return i.extend({template:n,events:{"click a[data-date-time-range]":a.handleRangeEvent,submit:function(){return this.changeFilter(),!1}},getTemplateData:function(){return{showProductFamily:!!this.options.productFamily}},afterRender:function(){t(this.el,this.serializeFormData()),this.$id("section").select2({width:"300px",allowClear:!0,multiple:!0,data:s.sections.map(r)}),this.options.productFamily&&this.$id("productFamily").select2({width:"300px",allowClear:!0,multiple:!0,data:s.productFamilies.map(r)}),o(this.$id("confirmer"),{width:"400px",multiple:!0,view:this})},serializeFormData:function(){var t=this.model,i=+t.get("from"),r=+t.get("to");return{"from-date":i?e.format(i,"YYYY-MM-DD"):"","to-date":r?e.format(r,"YYYY-MM-DD"):"",section:t.get("section").join(","),productFamily:(t.get("productFamily")||[]).join(","),confirmer:t.get("confirmer").join(",")}},changeFilter:function(){var t=a.serialize(this),e={from:t.from?t.from.valueOf():0,to:t.to?t.to.valueOf():0,section:[],productFamily:[],confirmer:[]};["section","productFamily","confirmer"].forEach(function(t){var i=this.$id(t).val();i&&(e[t]=i.split(","))},this),this.model.set(e),this.model.trigger("filtered")}})});