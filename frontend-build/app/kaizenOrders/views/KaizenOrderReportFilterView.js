// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["js2form","app/time","app/core/View","app/core/util/fixTimeRange","app/core/util/buttonGroup","app/kaizenOrders/templates/reportFilter","app/reports/util/prepareDateRange"],function(t,e,r,i,a,o,n){"use strict";return r.extend({template:o,events:{submit:function(){return this.changeFilter(),!1},"click a[data-range]":function(t){var e=n(t.target);this.$id("from").val(e.fromMoment.format("YYYY-MM-DD")),this.$id("to").val(e.toMoment.format("YYYY-MM-DD")),this.$('.btn[data-interval="'+e.interval+'"]').click(),this.$el.submit()}},afterRender:function(){t(this.el,this.serializeFormData()),a.toggle(this.$id("interval"))},serializeFormData:function(){var t=this.model,r=+t.get("from"),i=+t.get("to");return{interval:t.get("interval"),from:r?e.format(r,"YYYY-MM-DD"):"",to:i?e.format(i,"YYYY-MM-DD"):""}},changeFilter:function(){var t={from:e.getMoment(this.$id("from").val(),"YYYY-MM-DD").valueOf(),to:e.getMoment(this.$id("to").val(),"YYYY-MM-DD").valueOf(),interval:a.getValue(this.$id("interval"))};if((!t.from||t.from<0)&&(t.from=0),(!t.to||t.to<0)&&(t.to=0),t.from&&t.from===t.to){var r=e.getMoment(t.to).add(1,"days");this.$id("to").val(r.format("YYYY-MM-DD")),t.to=r.valueOf()}this.model.set(t),this.model.trigger("filtered")}})});