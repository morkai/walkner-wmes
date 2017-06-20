// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["js2form","app/time","app/updater/index","app/core/View","app/core/util/fixTimeRange","app/core/util/buttonGroup","app/core/util/idAndLabel","app/reports/util/prepareDateRange","app/qiResults/dictionaries","app/qiResults/templates/nokRatioReportFilter"],function(t,e,i,o,r,a,s,n,l,d){"use strict";return o.extend({template:d,events:{submit:function(){return this.changeFilter(),!1},"click a[data-range]":function(t){var e=n(t.target);this.$id("from").val(e.fromMoment.format("YYYY-MM")),this.$id("to").val(e.toMoment.format("YYYY-MM")),this.$el.submit()}},afterRender:function(){t(this.el,this.serializeFormData()),this.$id("kinds").select2({width:"300px",allowClear:!0,multiple:!0,data:l.kinds.map(s)}),(!i.versions.reports||i.versions.reports<=38)&&this.$id("kinds").select2("disable")},serializeFormData:function(){var t=this.model,i=+t.get("from"),o=+t.get("to");return{from:i?e.format(i,"YYYY-MM"):"",to:o?e.format(o,"YYYY-MM"):"",kinds:t.get("kinds").join(",")}},changeFilter:function(){var t={from:e.getMoment(this.$id("from").val(),"YYYY-MM").valueOf(),to:e.getMoment(this.$id("to").val(),"YYYY-MM").valueOf(),kinds:this.$id("kinds").val()};if((!t.from||t.from<0)&&(t.from=0),(!t.to||t.to<0)&&(t.to=0),t.from&&t.from===t.to){var i=e.getMoment(t.to).add(1,"months");this.$id("to").val(i.format("YYYY-MM")),t.to=i.valueOf()}t.kinds=""===t.kinds?[]:t.kinds.split(","),this.model.set(t),this.model.trigger("filtered")}})});