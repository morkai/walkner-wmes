// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["js2form","app/time","app/core/View","app/core/util/fixTimeRange","app/reports/templates/2/filter","app/reports/util/prepareDateRange"],function(t,e,i,r,a,n){"use strict";return i.extend({template:a,events:{submit:function(t){t.preventDefault(),this.changeFilter()},"click a[data-range]":function(t){var e=n(t.target);this.$id("from").val(e.fromMoment.format("YYYY-MM-DD")),this.$id("to").val(e.toMoment.format("YYYY-MM-DD")),this.$('.btn[data-interval="'+e.interval+'"]').click(),this.$el.submit()},"click #-showDisplayOptions":function(){this.trigger("showDisplayOptions")}},afterRender:function(){var e=this.serializeFormData();t(this.el,e),this.$("input[name=interval]:checked").closest(".btn").addClass("active")},serializeFormData:function(){return{interval:this.model.get("interval"),from:e.format(Number(this.model.get("from")),"YYYY-MM-DD"),to:e.format(Number(this.model.get("to")),"YYYY-MM-DD")}},changeFilter:function(){var t={rnd:Math.random(),from:null,to:null,interval:this.$id("intervals").find(".active > input").val(),skip:0},i=r.fromView(this);t.from=i.from||this.getFromMomentForSelectedInterval().valueOf(),t.to=i.to||Date.now(),this.$id("from").val(e.format(t.from,"YYYY-MM-DD")),this.$id("to").val(e.format(t.to,"YYYY-MM-DD")),this.model.set(t)},getSelectedInterval:function(){return this.$id("intervals").find(".active").attr("data-interval")},getFromMomentForSelectedInterval:function(){var t=e.getMoment().minutes(0).seconds(0).milliseconds(0);switch(this.getSelectedInterval()){case"month":return t.date(1).hours(6);case"week":return t.day(1).hours(6);default:return t.hour(6)}}})});