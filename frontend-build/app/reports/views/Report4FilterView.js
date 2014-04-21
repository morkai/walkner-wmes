// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","js2form","app/i18n","app/time","app/data/divisions","app/core/View","app/core/util/fixTimeRange","app/users/util/setUpUserSelect2","app/reports/templates/report4Filter","./prepareDateRange"],function(t,e,i,s,r,n,o,a,l,d){return n.extend({template:l,events:{"submit .filter-form":function(t){t.preventDefault(),this.changeFilter()},"click a[data-range]":function(t){var e=d(t.target.getAttribute("data-range"));this.$id("from").val(e.fromMoment.format("YYYY-MM-DD")),this.$id("to").val(e.toMoment.format("YYYY-MM-DD")),this.$('.btn[data-interval="'+e.interval+'"]').click(),this.$(".filter-form").submit()},"change input[name=mode]":function(){this.toggleMode(),this.toggleSubmit()}},initialize:function(){this.idPrefix=t.uniqueId("report4Filter")},destroy:function(){this.$('.select2-offscreen[tabindex="-1"]').select2("destroy")},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){var t=this.serializeFormData();e(this.el.querySelector(".filter-form"),t),this.$("input[name=interval]:checked").closest(".btn").addClass("active"),this.$("input[name=shift]:checked").closest(".btn").addClass("active");var i=a(this.$id("users"),{width:550,multiple:!0});i.select2("data",this.model.getUsersForSelect2()),i.on("change",this.toggleSubmit.bind(this)),this.toggleShift(),this.toggleMode(),this.toggleSubmit()},toggleShift:function(){var t=this.$id("shift");return t.find("> .active").length||(t.find("> .btn").addClass("active"),t.find("input").attr("checked",!0)),t},toggleMode:function(){var t=this.getSelectedMode();"shift"===t?(this.$id("users").select2("container").hide(),this.$id("shift").show()):(this.$id("shift").hide(),this.$id("users").select2("container").show())},toggleSubmit:function(){this.$(".filter-actions button").prop("disabled","shift"!==this.getSelectedMode()&&!this.$id("users").select2("data").length)},serializeFormData:function(){return{interval:this.model.get("interval"),from:s.format(+this.model.get("from"),"YYYY-MM-DD"),to:s.format(+this.model.get("to"),"YYYY-MM-DD"),mode:this.model.get("mode"),shift:this.model.get("shift")}},changeFilter:function(){var t={_rnd:Math.random(),from:null,to:null,interval:this.getSelectedInterval(),mode:this.getSelectedMode()},e=o.fromView(this);t.from=e.from||this.getFromMomentForSelectedInterval().valueOf(),t.to=e.to||Date.now(),this.$id("from").val(s.format(t.from,"YYYY-MM-DD")),this.$id("to").val(s.format(t.to,"YYYY-MM-DD")),"shift"===t.mode?t.shift=parseInt(this.$("input[name=shift]:checked").val(),10):t[t.mode]=this.$id("users").select2("val"),this.model.set(t,{reset:!0})},getSelectedInterval:function(){return this.$id("intervals").find(".active").attr("data-interval")},getSelectedMode:function(){return this.$("input[name=mode]:checked").val()},getFromMomentForSelectedInterval:function(){var t=s.getMoment().minutes(0).seconds(0).milliseconds(0);switch(this.getSelectedInterval()){case"month":return t.date(1).hours(6);case"week":return t.day(1).hours(6);default:return t.hour(6)}}})});