// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","js2form","app/time","app/data/divisions","app/data/subdivisions","app/data/views/OrgUnitDropdownsView","app/core/Model","app/core/views/FilterView","app/fte/templates/filter"],function(i,e,t,s,n,o,r,a,d){var u=o.ORG_UNIT;return a.extend({template:d,defaultFormData:{division:"",subdivision:"",date:"",shift:0},termToForm:{division:function(i,e,t){t[i]=e.args[1],("division"===i?s:n).get(t[i])||(t[i]="")},date:function(i,e,s){if("in"===e.name)s.date=t.format(e.args[1][0],"YYYY-MM-DD");else{var n=t.getMoment(e.args[1]);s.date=n.format("YYYY-MM-DD"),s.shift=this.getShiftNoFromMoment(n)}},shift:function(i,e,t){t.shift=e.args[1]},subdivision:"division"},initialize:function(){this.orgUnitDropdownsView=new o({orgUnit:this.options.divisionOnly?u.DIVISION:u.SUBDIVISION,divisionFilter:this.options.divisionFilter||null,allowClear:!0,noGrid:!0}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){a.prototype.afterRender.call(this),this.listenToOnce(this.orgUnitDropdownsView,"afterRender",function(){var i=null,e=null,t=this.formData;""!==t.subdivision?(e=u.SUBDIVISION,i=new r({subdivision:t.subdivision})):""!==t.division&&(e=u.DIVISION,i=new r({division:t.division})),this.orgUnitDropdownsView.selectValue(i,e)})},serializeFormToQuery:function(e){var s=this.orgUnitDropdownsView.$id("division").val(),n=this.orgUnitDropdownsView.$id("subdivision").val(),o=t.getMoment(this.$id("date").val()),r=parseInt(this.$("input[name=shift]:checked").val(),10);if(this.setHoursByShiftNo(o,r),i.isEmpty(n)?i.isEmpty(s)||e.push({name:"eq",args:["division",s]}):e.push({name:"eq",args:["subdivision",n]}),o.isValid())if(0===r){var a=o.valueOf();e.push({name:"in",args:["date",[a+216e5,a+504e5,a+792e5]]})}else e.push({name:"eq",args:["date",o.valueOf()]});else 0!==r&&e.push({name:"eq",args:["shift",r]})},getShiftNoFromMoment:function(i){var e=i.hours();return 6===e?1:14===e?2:22===e?3:0},setHoursByShiftNo:function(i,e){i.hours(1===e?6:2===e?14:3===e?22:0)}})});