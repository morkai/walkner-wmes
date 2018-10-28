define(["underscore","js2form","app/i18n","app/time","app/viewport","app/core/View","app/core/util/fixTimeRange","app/reports/templates/1/filter","app/reports/util/prepareDateRange","app/reports/views/OrgUnitPickerView"],function(t,e,i,n,r,a,o,s,l,d){"use strict";return a.extend({template:s,events:{submit:function(t){t.preventDefault(),this.changeFilter()},"change input[name=mode]":"onModeChange","click a[data-range]":function(t){var e=l(t.target,!0);this.$id("from-date").val(e.fromMoment.format("YYYY-MM-DD")),this.$id("from-time").val(e.fromMoment.format("HH:mm")),this.$id("to-date").val(e.toMoment.format("YYYY-MM-DD")),this.$id("to-time").val(e.toMoment.format("HH:mm")),this.$id("mode-date").click(),this.$('.btn[data-interval="'+e.interval+'"]').click(),this.checkDateIntervalValidity(),this.$el.submit()},"click #-showDisplayOptions":function(){this.trigger("showDisplayOptions")},"click #-ignoredOrgUnits":"showIgnoredOrgUnitsDialog",'change input[name="interval"]':"checkDateIntervalValidity",'change input[type="date"]':"checkDateIntervalValidity"},initialize:function(){this.ignoredOrgUnits=this.model.get("ignoredOrgUnits")},afterRender:function(){var t=this.serializeFormData();e(this.el,t),this.$("[name=interval]:checked").closest(".btn").addClass("active"),this.toggleIgnoredOrgUnits(),this.onModeChange()},toggleIgnoredOrgUnits:function(){this.$id("ignoredOrgUnits").toggleClass("active",!t.isEmpty(this.ignoredOrgUnits))},onModeChange:function(){var t=this,e="online"===this.getSelectedMode();this.$(".filter-dateRange .form-control").prop("disabled",e);var i=this.$id("intervals").find(".btn");(i.each(function(){var i=this.getAttribute("data-interval"),n=e&&"shift"!==i&&"hour"!==i;t.$(this).toggleClass("disabled",n)}),e)?i.filter(".active.disabled").length&&i.filter("[data-interval=hour]").click():this.$id("from").select();this.checkDateIntervalValidity()},serializeFormData:function(){var t={mode:"online",interval:this.model.get("interval")},e=parseInt(this.model.get("from"),10),i=parseInt(this.model.get("to"),10);return t["from-date"]=n.format(e,"YYYY-MM-DD"),t["from-time"]=n.format(e,"HH:mm"),t["to-date"]=n.format(i,"YYYY-MM-DD"),t["to-time"]=n.format(i,"HH:mm"),(e||i)&&(t.mode="date"),t},changeFilter:function(){var e,i,r={rnd:Math.random(),from:null,to:null,interval:this.$id("intervals").find(".active > input").val(),ignoredOrgUnits:t.extend({},this.ignoredOrgUnits)};if("date"===this.getSelectedMode()){var a=o.fromView(this,{defaultTime:"06:00"});r.from=a.from||this.getFromMomentForSelectedInterval().valueOf(),r.to=a.to||Date.now(),e=n.getMoment(r.from),i=n.getMoment(r.to)}else i=(e=this.model.getFirstShiftMoment()).clone().add(1,"days");this.$id("from-date").val(e.format("YYYY-MM-DD")),this.$id("from-time").val(e.format("HH:mm")),this.$id("to-date").val(i.format("YYYY-MM-DD")),this.$id("to-time").val(i.format("HH:mm")),this.model.set(r)},getSelectedMode:function(){return this.$("input[name=mode]:checked").val()},getSelectedInterval:function(){return this.$('input[name="interval"]:checked').val()},getFromMomentForSelectedInterval:function(){var t=n.getMoment().minutes(0).seconds(0).milliseconds(0);switch(this.getSelectedInterval()){case"month":return t.date(1).hours(6);case"week":return t.day(1).hours(6);default:return t.hour(6)}},showIgnoredOrgUnitsDialog:function(){var t=this,e=new d({model:this.ignoredOrgUnits});e.once("picked",function(e){t.ignoredOrgUnits=e,t.toggleIgnoredOrgUnits(),r.closeDialog()}),r.showDialog(e,i("reports","filter:ignoredOrgUnits"))},checkDateIntervalValidity:function(){this.getSelectedMode(),this.getSelectedInterval(),o.fromView(this,{defaultTime:"06:00"})}})});