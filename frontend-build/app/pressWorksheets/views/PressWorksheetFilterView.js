define(["underscore","js2form","app/i18n","app/user","app/time","app/core/Model","app/core/View","app/pressWorksheets/templates/filter"],function(e,t,i,r,s,a,n,o){return n.extend({template:o,events:{"submit .filter-form":function(e){e.preventDefault(),this.changeFilter()}},initialize:function(){this.idPrefix=e.uniqueId("pressWorksheetsFilter")},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){var e=this.serializeRqlQuery();t(this.el.querySelector(".filter-form"),e),this.toggleButtonGroup("shift"),this.toggleButtonGroup("type")},toggleButtonGroup:function(e){this.$id(e).find("input:checked").parent().addClass("active")},serializeRqlQuery:function(){var e=this.model.rqlQuery,t={date:"",shift:0,type:"any",limit:e.limit<5?5:e.limit>100?100:e.limit},i=this;return e.selector.args.forEach(function(e){if("eq"===e.name||"in"===e.name){var r=e.args[0];switch(r){case"date":if("in"===e.name)t.date=s.format(e.args[1][0],"YYYY-MM-DD");else{var a=s.getMoment(e.args[1]);t.date=a.format("YYYY-MM-DD"),t.shift=i.getShiftNoFromMoment(a)}break;case"shift":case"type":t[r]=e.args[1]}}}),t},changeFilter:function(){var e=this.model.rqlQuery,t=[],i=s.getMoment(this.$id("date").val()),r=parseInt(this.$("input[name=shift]:checked").val(),10),a=this.$("input[name=type]:checked").val();if(this.setHoursByShiftNo(i,r),i.isValid())if(0===r){var n=i.valueOf();t.push({name:"in",args:["date",[n+216e5,n+504e5,n+792e5]]})}else t.push({name:"eq",args:["date",i.valueOf()]});else 0!==r&&t.push({name:"eq",args:["shift",r]});"any"!==a&&t.push({name:"eq",args:["type",a]}),e.selector={name:"and",args:t},e.limit=parseInt(this.$id("limit").val(),10)||15,e.skip=0,this.trigger("filterChanged",e)},getShiftNoFromMoment:function(e){var t=e.hours();return 6===t?1:14===t?2:22===t?3:0},setHoursByShiftNo:function(e,t){e.hours(1===t?6:2===t?14:3===t?22:0)}})});