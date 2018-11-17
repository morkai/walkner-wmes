define(["js2form","app/time","app/data/divisions","app/core/View","app/core/util/buttonGroup","app/core/util/forms/dateTimeRange","app/users/util/setUpUserSelect2","app/reports/templates/4/filter"],function(t,e,i,s,n,o,a,d){"use strict";return s.extend({template:d,events:{"click a[data-date-time-range]":o.handleRangeEvent,submit:function(t){t.preventDefault(),this.toggleDivisions(),this.changeFilter()},"change input[name=mode]":function(){this.toggleMode(),this.toggleSubmit()},'change input[name="divisions[]"]':function(){var t=[],e=this.$('input[name="divisions[]"]');e.filter(":checked").each(function(){t.push(this.value)}),this.model.set("divisions",t.length===e.length?[]:t)},'change input[name="shifts[]"]':function(){var t=[],e=this.$('input[name="shifts[]"]');e.filter(":checked").each(function(){t.push(+this.value)}),this.model.set("shifts",t.length===e.length?[]:t)}},serialize:function(){return{idPrefix:this.idPrefix,divisions:i.filter(function(t){return"prod"===t.get("type")}).sort(function(t,e){return t.getLabel().localeCompare(e.getLabel())}).map(function(t){return{id:t.id,label:t.id,title:t.get("description")}})}},afterRender:function(){var e=this.serializeFormData();t(this.el,e),this.$('input[name="interval"]:checked').closest(".btn").addClass("active"),this.$('input[name="shift"]:checked').closest(".btn").addClass("active"),a(this.$id("users"),{width:550,multiple:!0,view:this}).on("change",this.toggleSubmit.bind(this)),this.toggleShift(),this.toggleMode(),this.toggleDivisions(),this.toggleShifts(),this.toggleSubmit()},toggleShift:function(){var t=this.$id("shift");return t.find("> .active").length||(t.find("> .btn").addClass("active"),t.find("input").prop("checked",!0)),t},toggleMode:function(){"shift"===this.getSelectedMode()?(this.$id("users").select2("container").hide(),this.$id("shift").show()):(this.$id("shift").hide(),this.$id("users").select2("container").show())},toggleDivisions:function(){var t=this.$id("divisions");n.toggle(t),t.find("> .active").length||(t.find("> .btn").addClass("active"),t.find("input").prop("checked",!0))},toggleShifts:function(){var t=this.$id("shifts");n.toggle(t),t.find("> .active").length||(t.find("> .btn").addClass("active"),t.find("input").prop("checked",!0))},toggleSubmit:function(){this.$(".filter-actions button").prop("disabled","shift"!==this.getSelectedMode()&&!this.$id("users").select2("data").length)},serializeFormData:function(){return{interval:this.model.get("interval"),"from-date":e.format(+this.model.get("from"),"YYYY-MM-DD"),"to-date":e.format(+this.model.get("to"),"YYYY-MM-DD"),mode:this.model.get("mode"),shift:this.model.get("shift"),divisions:this.model.get("divisions"),shifts:this.model.get("shifts"),users:this.model.getUsersForSelect2().map(function(t){return t.id}).join("")}},changeFilter:function(){var t={_rnd:Math.random(),from:null,to:null,interval:this.getSelectedInterval(),mode:this.getSelectedMode()},i=o.serialize(this),s=i.from||this.getFromMomentForSelectedInterval(),n=i.to||e.getMoment();t.from=s.valueOf(),t.to=n.valueOf(),this.$id("from-date").val(s.format("YYYY-MM-DD")),this.$id("to-date").val(n.format("YYYY-MM-DD")),"shift"===t.mode?t.shift=parseInt(this.$("input[name=shift]:checked").val(),10):t[t.mode]=this.$id("users").select2("val"),this.model.set(t,{reset:!0})},getSelectedInterval:function(){return this.$id("intervals").find(".active").attr("data-interval")},getSelectedMode:function(){return this.$('input[name="mode"]:checked').val()},getFromMomentForSelectedInterval:function(){var t=e.getMoment().minutes(0).seconds(0).milliseconds(0);switch(this.getSelectedInterval()){case"month":return t.date(1).hours(6);case"week":return t.day(1).hours(6);default:return t.hour(6)}}})});