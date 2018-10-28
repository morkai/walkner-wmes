define(["js2form","app/time","app/core/View","app/core/util/fixTimeRange","app/core/util/buttonGroup","app/reports/util/prepareDateRange","app/paintShop/templates/load/filter"],function(t,e,i,a,r,o,n){"use strict";return i.extend({template:n,events:{submit:function(){return this.changeFilter(),!1},"click a[data-range]":function(t){var e=o(t.target);this.$id("from").val(e.fromMoment.format("YYYY-MM-DD")),this.$id("to").val(e.toMoment.format("YYYY-MM-DD")),this.$('.btn[data-interval="'+e.interval+'"]').click(),this.$el.submit()}},afterRender:function(){t(this.el,this.serializeFormData()),r.toggle(this.$id("interval"))},serializeFormData:function(){var t=this.model,i=+t.get("from"),a=+t.get("to");return{interval:t.get("interval"),from:i?e.format(i,"YYYY-MM-DD"):"",to:a?e.format(a,"YYYY-MM-DD"):""}},changeFilter:function(){var t={interval:r.getValue(this.$id("interval")),from:e.getMoment(this.$id("from").val(),"YYYY-MM-DD").valueOf(),to:e.getMoment(this.$id("to").val(),"YYYY-MM-DD").valueOf()};if((!t.from||t.from<0)&&(t.from=0),(!t.to||t.to<0)&&(t.to=0),t.from&&t.from===t.to){var i=e.getMoment(t.to).add(1,"days");this.$id("to").val(i.format("YYYY-MM-DD")),t.to=i.valueOf()}this.model.set(t),this.model.trigger("filtered")}})});