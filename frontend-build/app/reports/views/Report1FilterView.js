define(["underscore","js2form","moment","app/i18n","app/time","app/core/View","app/core/util/fixTimeRange","app/reports/templates/report1Filter"],function(e,t,i,a,r,o,n,s){return o.extend({template:s,events:{"submit .filter-form":function(e){e.preventDefault(),this.changeFilter()},"change input[name=mode]":"onModeChange","click .btn[data-range]":function(e){var t,a=i().minutes(0).seconds(0).milliseconds(0),r="day";switch(e.target.getAttribute("data-range")){case"month":a.date(1).hours(6),t=a.clone().add("months",1);break;case"week":a.weekday(0).hours(6),t=a.clone().add("days",7);break;case"day":a.hours(6),t=a.clone().add("days",1),r="shift";break;case"shift":var o=a.hours();o>=6&&14>o?a.hours(6):o>=14&&22>o?a.hours(14):(a.hours(22),6>o&&a.subtract("days",1)),t=a.clone().add("hours",8),r="hour"}this.$id("from-date").val(a.format("YYYY-MM-DD")),this.$id("from-time").val(a.format("HH:mm")),this.$id("to-date").val(t.format("YYYY-MM-DD")),this.$id("to-time").val(t.format("HH:mm")),this.$id("mode-date").click(),this.$(".btn[data-interval="+r+"]").click(),this.$(".filter-form").submit()}},initialize:function(){this.idPrefix=e.uniqueId("report1Filter")},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){var e=this.serializeFormData();t(this.el.querySelector(".filter-form"),e),this.$("[name=interval]:checked").closest(".btn").addClass("active"),this.$("[name=subdivisionType]:checked").closest(".btn").addClass("active"),this.toggleSubdivisionType(),this.onModeChange()},toggleSubdivisionType:function(){var e=this.$(".reports-1-filter-subdivisionTypes");return e.find("> .active").length||e.find("> .btn").addClass("active"),e},onModeChange:function(){var e="online"===this.getSelectedMode();this.$(".filter-dateRange .form-control").attr("disabled",e);var t=this.$(".reports-1-filter-intervals > .btn");if(t.filter("[data-interval=month], [data-interval=week], [data-interval=day]")[e?"addClass":"removeClass"]("disabled"),e){var i=t.filter(".active.disabled");i.length&&t.filter("[data-interval=hour]").click()}else this.$id("from").select()},serializeFormData:function(){var e={mode:"online",interval:this.model.get("interval"),subdivisionType:this.model.get("subdivisionType")},t=parseInt(this.model.get("from"),10),i=parseInt(this.model.get("to"),10);return e["from-date"]=r.format(t,"YYYY-MM-DD"),e["from-time"]=r.format(t,"HH:mm"),e["to-date"]=r.format(i,"YYYY-MM-DD"),e["to-time"]=r.format(i,"HH:mm"),(t||i)&&(e.mode="date"),e},changeFilter:function(){var e={rnd:Math.random(),from:null,to:null,interval:this.$(".reports-1-filter-intervals > .active > input").val(),subdivisionType:null},t=this.toggleSubdivisionType().find("> .active");1===t.length&&(e.subdivisionType=t.find("input").val());var a,r;if("date"===this.getSelectedMode()){var o=n.fromView(this,{defaultTime:"06:00"});e.from=o.from||this.getFromMomentForSelectedInterval().valueOf(),e.to=o.to||Date.now(),a=i(e.from),r=i(e.to)}else a=this.model.getFirstShiftMoment(),r=a.clone().add("days",1);this.$id("from-date").val(a.format("YYYY-MM-DD")),this.$id("from-time").val(a.format("HH:mm")),this.$id("to-date").val(r.format("YYYY-MM-DD")),this.$id("to-time").val(r.format("HH:mm")),this.model.set(e)},getSelectedMode:function(){return this.$("input[name=mode]:checked").val()},getSelectedInterval:function(){return this.$(".reports-1-filter-intervals > .active").attr("data-interval")},getFromMomentForSelectedInterval:function(){var e=i().minutes(0).seconds(0).milliseconds(0);switch(this.getSelectedInterval()){case"month":return e.date(1).hours(6);case"week":return e.day(1).hours(6);default:return e.hour(6)}}})});