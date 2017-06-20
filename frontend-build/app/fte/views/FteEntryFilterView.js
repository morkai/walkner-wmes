// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","js2form","app/time","app/data/divisions","app/data/subdivisions","app/data/views/OrgUnitDropdownsView","app/core/Model","app/core/views/FilterView","app/fte/templates/filter"],function(i,s,o,t,n,e,r,a,d){"use strict";var u=e.ORG_UNIT;return a.extend({template:d,defaultFormData:{division:"",subdivision:"",from:"",to:"",shift:0},termToForm:{division:function(i,s,o){o[i]=s.args[1],("division"===i?t:n).get(o[i])||(o[i]="")},date:function(i,s,t){t["ge"===s.name?"from":"to"]=o.format(s.args[1],"YYYY-MM-DD")},shift:function(i,s,o){o.shift=s.args[1]},subdivision:"division"},initialize:function(){this.orgUnitDropdownsView=new e({orgUnit:this.options.divisionOnly?u.DIVISION:u.SUBDIVISION,divisionFilter:this.options.divisionFilter||null,allowClear:!0,noGrid:!0}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){a.prototype.afterRender.call(this),this.listenToOnce(this.orgUnitDropdownsView,"afterRender",function(){var i=null,s=null,o=this.formData;""!==o.subdivision?(s=u.SUBDIVISION,i=new r({subdivision:o.subdivision})):""!==o.division&&(s=u.DIVISION,i=new r({division:o.division})),this.orgUnitDropdownsView.selectValue(i,s)})},serializeFormToQuery:function(s){var t=this.orgUnitDropdownsView.$id("division").val(),n=this.orgUnitDropdownsView.$id("subdivision").val(),e=o.getMoment(this.$id("from").val(),"YYYY-MM-DD"),r=o.getMoment(this.$id("to").val(),"YYYY-MM-DD"),a=parseInt(this.$("input[name=shift]:checked").val(),10);i.isEmpty(n)?i.isEmpty(t)||s.push({name:"eq",args:["division",t]}):s.push({name:"eq",args:["subdivision",n]}),e.isValid()&&s.push({name:"ge",args:["date",e.hours(6).valueOf()]}),r.isValid()&&(r.hours(6),r.valueOf()===e.valueOf()&&this.$id("to").val(r.add(1,"days").format("YYYY-MM-DD")),s.push({name:"lt",args:["date",r.valueOf()]})),0!==a&&s.push({name:"eq",args:["shift",a]})},getShiftNoFromMoment:function(i){var s=i.hours();return 6===s?1:14===s?2:22===s?3:0},setHoursByShiftNo:function(i,s){1===s?i.hours(6):2===s?i.hours(14):3===s?i.hours(22):i.hours(0)}})});