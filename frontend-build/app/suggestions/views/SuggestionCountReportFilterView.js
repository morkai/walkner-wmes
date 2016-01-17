// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["js2form","app/time","app/core/View","app/core/util/fixTimeRange","app/core/util/buttonGroup","app/core/util/idAndLabel","app/reports/util/prepareDateRange","app/kaizenOrders/dictionaries","app/suggestions/templates/countReportFilter"],function(t,e,i,o,a,r,s,n,l){"use strict";return i.extend({template:l,events:{submit:function(){return this.changeFilter(),!1},"click a[data-range]":function(t){var e=s(t.target);this.$id("from").val(e.fromMoment.format("YYYY-MM-DD")),this.$id("to").val(e.toMoment.format("YYYY-MM-DD")),this.$('.btn[data-interval="'+e.interval+'"]').click(),this.$el.submit()}},afterRender:function(){t(this.el,this.serializeFormData()),a.toggle(this.$id("interval")),this.$id("sections").select2({width:"400px",allowClear:!0,multiple:!0,data:n.sections.map(r)})},serializeFormData:function(){var t=this.model,i=+t.get("from"),o=+t.get("to");return{interval:t.get("interval"),from:i?e.format(i,"YYYY-MM-DD"):"",to:o?e.format(o,"YYYY-MM-DD"):"",sections:t.get("sections").join(",")}},changeFilter:function(){var t={from:e.getMoment(this.$id("from").val(),"YYYY-MM-DD").valueOf(),to:e.getMoment(this.$id("to").val(),"YYYY-MM-DD").valueOf(),interval:a.getValue(this.$id("interval")),sections:this.$id("sections").val()};if((!t.from||t.from<0)&&(t.from=0),(!t.to||t.to<0)&&(t.to=0),t.from&&t.from===t.to){var i=e.getMoment(t.to).add(1,"days");this.$id("to").val(i.format("YYYY-MM-DD")),t.to=i.valueOf()}t.sections=""===t.sections?[]:t.sections.split(","),this.model.set(t),this.model.trigger("filtered")}})});