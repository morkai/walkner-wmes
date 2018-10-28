define(["js2form","app/time","app/core/View","app/core/util/fixTimeRange","app/core/util/idAndLabel","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","app/suggestions/templates/summaryReportFilter","app/reports/util/prepareDateRange"],function(t,i,e,o,r,a,s,l,m){"use strict";return e.extend({template:l,events:{submit:function(){return this.changeFilter(),!1},"click a[data-range]":function(t){var i=m(t.target);this.$id("from").val(i.fromMoment.format("YYYY-MM-DD")),this.$id("to").val(i.toMoment.format("YYYY-MM-DD")),this.$el.submit()}},serialize:function(){return{idPrefix:this.idPrefix,showProductFamily:!!this.options.productFamily}},afterRender:function(){t(this.el,this.serializeFormData()),this.$id("section").select2({width:"300px",allowClear:!0,multiple:!0,data:s.sections.map(r)}),this.options.productFamily&&this.$id("productFamily").select2({width:"300px",allowClear:!0,multiple:!0,data:s.productFamilies.map(r)}),a(this.$id("confirmer"),{width:"400px",multiple:!0,view:this})},serializeFormData:function(){var t=this.model,e=+t.get("from"),o=+t.get("to");return{from:e?i.format(e,"YYYY-MM-DD"):"",to:o?i.format(o,"YYYY-MM-DD"):"",section:t.get("section").join(","),productFamily:(t.get("productFamily")||[]).join(","),confirmer:t.get("confirmer").join(",")}},changeFilter:function(){var t={from:i.getMoment(this.$id("from").val(),"YYYY-MM-DD").valueOf(),to:i.getMoment(this.$id("to").val(),"YYYY-MM-DD").valueOf(),section:[],productFamily:[],confirmer:[]};if((!t.from||t.from<0)&&(t.from=0),(!t.to||t.to<0)&&(t.to=0),t.from&&t.from===t.to){var e=i.getMoment(t.to).add(1,"days");this.$id("to").val(e.format("YYYY-MM-DD")),t.to=e.valueOf()}["section","productFamily","confirmer"].forEach(function(i){var e=this.$id(i).val();e&&(t[i]=e.split(","))},this),this.model.set(t),this.model.trigger("filtered")}})});