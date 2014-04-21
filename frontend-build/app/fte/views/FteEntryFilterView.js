// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","js2form","app/i18n","app/user","app/time","app/data/divisions","app/data/subdivisions","app/data/views/OrgUnitDropdownsView","app/core/Model","app/core/View","app/fte/templates/filter"],function(i,e,t,s,n,r,o,a,d,l,u){var f=a.ORG_UNIT;return l.extend({template:u,events:{"submit .filter-form":function(i){i.preventDefault(),this.changeFilter()}},initialize:function(){this.idPrefix=i.uniqueId("fteFilter"),this.orgUnitDropdownsView=new a({orgUnit:this.options.divisionOnly?f.DIVISION:f.SUBDIVISION,divisionFilter:this.options.divisionFilter||null,allowClear:!0,noGrid:!0}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){var i=this.serializeRqlQuery();e(this.el.querySelector(".filter-form"),i),this.listenToOnce(this.orgUnitDropdownsView,"afterRender",function(){var e=null,t=null;""!==i.subdivision?(t=f.SUBDIVISION,e=new d({subdivision:i.subdivision})):""!==i.division&&(t=f.DIVISION,e=new d({division:i.division})),this.orgUnitDropdownsView.selectValue(e,t)})},serializeRqlQuery:function(){var i=this.model.rqlQuery,e={division:"",subdivision:"",date:"",shift:0,limit:i.limit<5?5:i.limit>100?100:i.limit},t=this;return i.selector.args.forEach(function(i){if("eq"===i.name||"in"===i.name){var s=i.args[0];switch(s){case"division":case"subdivision":e[s]=i.args[1],("division"===s?r:o).get(e[s])||(e[s]="");break;case"date":if("in"===i.name)e.date=n.format(i.args[1][0],"YYYY-MM-DD");else{var a=n.getMoment(i.args[1]);e.date=a.format("YYYY-MM-DD"),e.shift=t.getShiftNoFromMoment(a)}break;case"shift":e.shift=i.args[1]}}}),e},changeFilter:function(){var e=this.model.rqlQuery,t=[],s=this.orgUnitDropdownsView.$id("division").val(),r=this.orgUnitDropdownsView.$id("subdivision").val(),o=n.getMoment(this.$id("date").val()),a=parseInt(this.$("input[name=shift]:checked").val(),10);if(this.setHoursByShiftNo(o,a),i.isEmpty(r)?i.isEmpty(s)||t.push({name:"eq",args:["division",s]}):t.push({name:"eq",args:["subdivision",r]}),o.isValid())if(0===a){var d=o.valueOf();t.push({name:"in",args:["date",[d+216e5,d+504e5,d+792e5]]})}else t.push({name:"eq",args:["date",o.valueOf()]});else 0!==a&&t.push({name:"eq",args:["shift",a]});e.selector={name:"and",args:t},e.limit=parseInt(this.$id("limit").val(),10)||15,e.skip=0,this.trigger("filterChanged",e)},getShiftNoFromMoment:function(i){var e=i.hours();return 6===e?1:14===e?2:22===e?3:0},setHoursByShiftNo:function(i,e){i.hours(1===e?6:2===e?14:3===e?22:0)}})});