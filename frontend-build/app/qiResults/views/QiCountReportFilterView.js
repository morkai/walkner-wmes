// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["js2form","app/time","app/core/View","app/core/util/fixTimeRange","app/core/util/buttonGroup","app/core/util/idAndLabel","app/reports/util/prepareDateRange","app/qiResults/dictionaries","app/qiResults/templates/countReportFilter"],function(t,e,i,r,a,o,l,s,d){"use strict";return i.extend({template:d,events:{submit:function(){return this.changeFilter(),!1},"click a[data-range]":function(t){var e=l(t.target);this.$id("from").val(e.fromMoment.format("YYYY-MM-DD")),this.$id("to").val(e.toMoment.format("YYYY-MM-DD")),this.$('.btn[data-interval="'+e.interval+'"]').click(),this.$el.submit()}},afterRender:function(){t(this.el,this.serializeFormData()),a.toggle(this.$id("interval")),this.$id("productFamilies").select2({width:"190px",allowClear:!0,multiple:!0,data:s.productFamilies.map(function(t){return{id:t,text:t}})}),this.$id("kinds").select2({width:"200px",allowClear:!0,multiple:!0,containerCssClass:"qi-countReport-clipSelect2",data:s.kinds.map(o)}),this.$id("errorCategories").select2({width:"180px",allowClear:!0,multiple:!0,data:s.errorCategories.map(o)}),this.$id("faultCodes").select2({width:"180px",allowClear:!0,multiple:!0,data:s.faults.map(o)}),this.$id("inspector").select2({width:"200px",allowClear:!0,placeholder:" ",data:s.inspectors.map(o)})},serializeFormData:function(){var t=this.model,i=+t.get("from"),r=+t.get("to");return{interval:t.get("interval"),from:i?e.format(i,"YYYY-MM-DD"):"",to:r?e.format(r,"YYYY-MM-DD"):"",productFamilies:t.get("productFamilies"),kinds:t.get("kinds").join(","),errorCategories:t.get("errorCategories").join(","),faultCodes:t.get("faultCodes").join(","),inspector:t.get("inspector")}},changeFilter:function(){var t={from:e.getMoment(this.$id("from").val(),"YYYY-MM-DD").valueOf(),to:e.getMoment(this.$id("to").val(),"YYYY-MM-DD").valueOf(),interval:a.getValue(this.$id("interval")),productFamilies:this.$id("productFamilies").val(),kinds:this.$id("kinds").val(),errorCategories:this.$id("errorCategories").val(),faultCodes:this.$id("faultCodes").val(),inspector:this.$id("inspector").val()};if((!t.from||t.from<0)&&(t.from=0),(!t.to||t.to<0)&&(t.to=0),t.from&&t.from===t.to){var i=e.getMoment(t.to).add(1,"days");this.$id("to").val(i.format("YYYY-MM-DD")),t.to=i.valueOf()}t.kinds=""===t.kinds?[]:t.kinds.split(","),t.errorCategories=""===t.errorCategories?[]:t.errorCategories.split(","),t.faultCodes=""===t.faultCodes?[]:t.faultCodes.split(","),this.model.set(t),this.model.trigger("filtered")}})});