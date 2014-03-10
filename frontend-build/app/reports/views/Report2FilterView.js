define(["underscore","js2form","app/i18n","app/time","app/core/View","app/core/util/fixTimeRange","app/reports/templates/report2Filter","./prepareDateRange"],function(t,e,r,i,a,n,o,l){return a.extend({template:o,events:{"submit .filter-form":function(t){t.preventDefault(),this.changeFilter()},"click a[data-range]":function(t){var e=l(t.target.getAttribute("data-range"));this.$id("from").val(e.fromMoment.format("YYYY-MM-DD")),this.$id("to").val(e.toMoment.format("YYYY-MM-DD")),this.$('.btn[data-interval="'+e.interval+'"]').click(),this.$(".filter-form").submit()}},initialize:function(){this.idPrefix=t.uniqueId("report2Filter")},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){var t=this.serializeFormData();e(this.el.querySelector(".filter-form"),t),this.$("input[name=interval]:checked").closest(".btn").addClass("active")},serializeFormData:function(){return{interval:this.model.get("interval"),from:i.format(Number(this.model.get("from")),"YYYY-MM-DD"),to:i.format(Number(this.model.get("to")),"YYYY-MM-DD")}},changeFilter:function(){var t={rnd:Math.random(),from:null,to:null,interval:this.$id("intervals").find(".active > input").val()},e=n.fromView(this);t.from=e.from||this.getFromMomentForSelectedInterval().valueOf(),t.to=e.to||Date.now(),this.$id("from").val(i.format(t.from,"YYYY-MM-DD")),this.$id("to").val(i.format(t.to,"YYYY-MM-DD")),this.model.set(t)},getSelectedInterval:function(){return this.$id("intervals").find(".active").attr("data-interval")},getFromMomentForSelectedInterval:function(){var t=i.getMoment().minutes(0).seconds(0).milliseconds(0);switch(this.getSelectedInterval()){case"month":return t.date(1).hours(6);case"week":return t.day(1).hours(6);default:return t.hour(6)}}})});