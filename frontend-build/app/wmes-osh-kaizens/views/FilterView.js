define(["underscore","jquery","app/user","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/core/util/idAndLabel","app/users/util/setUpUserSelect2","app/wmes-osh-common/dictionaries","app/wmes-osh-kaizens/templates/filter","app/core/util/ExpandableSelect"],function(e,t,i,a,l,s,o,n,r){"use strict";return a.extend({filterList:["createdAt","workplace","division","building","location","kind","limit"],filterMap:{},template:r,events:Object.assign({"click a[data-date-time-range]":l.handleRangeEvent,'change input[name="userType"]':function(){"mine"===this.$('input[name="userType"]:checked').val()&&this.$id("user").select2("data",{id:i.data._id,text:i.getLabel()})}},a.prototype.events),defaultFormData:function(){return{userType:"others"}},termToForm:{createdAt:l.rqlToForm,workplace:(e,t,i)=>{i[e]="in"===t.name?t.args[1].join(","):t.args[1]},division:"workplace",building:"workplace",location:"workplace",kind:(e,t,i)=>{i[e]="in"===t.name?t.args[1]:[t.args[1]]},"participants.user.id":(e,t,a)=>{const l=t.args[1];a.userType=l===i.data._id?"mine":"others",a.user=l}},getTemplateData:function(){return{statuses:n.statuses.kaizen.map(e=>({value:e,label:n.getLabel("status",e)})),kinds:n.kinds.map(e=>({value:e.id,label:e.getLabel({long:!0})}))}},serializeFormToQuery:function(e){l.formToRql(this,e),["status","workplace","division","building","location","kind"].forEach(t=>{const i=this.$id(t);let a=i.val();a&&a.length&&("string"==typeof a&&(a=a.split(",")),"SELECT"===i[0].tagName&&i[0].options.length===a.length||(1===(a=a.map(e=>/^[0-9]+$/.test(e)?parseInt(e,10):e)).length?e.push({name:"eq",args:[t,a[0]]}):e.push({name:"in",args:[t,a]})))});const t=this.$id("user").val();t&&e.push({name:"eq",args:["participants.user.id",t]})},afterRender:function(){a.prototype.afterRender.call(this),this.$(".is-expandable").expandableSelect(),o(this.$id("user"),{view:this,width:"100%"}),this.setUpWorkplaceSelect2(),this.setUpDivisionSelect2(),this.setUpBuildingSelect2(),this.setUpLocationSelect2()},setUpWorkplaceSelect2:function(){this.$id("workplace").select2({width:"250px",multiple:!0,placeholder:" ",data:n.workplaces.filter(e=>e.get("active")).map(e=>({id:e.id,text:e.getLabel({long:!0}),model:e})),formatSelection:({model:e},t,i)=>i(e.getLabel())})},setUpDivisionSelect2:function(){this.$id("division").select2({width:"250px",multiple:!0,placeholder:" ",data:n.workplaces.filter(e=>e.get("active")).map(e=>({text:e.getLabel({long:!0}),children:n.divisions.filter(t=>t.get("active")&&t.get("workplace")===e.id).map(e=>({id:e.id,text:e.getLabel({long:!0}),model:e}))})),formatSelection:({model:e},t,i)=>i(e.getLabel())})},setUpBuildingSelect2:function(){this.$id("building").select2({width:"250px",multiple:!0,placeholder:" ",data:n.buildings.filter(e=>e.get("active")).map(e=>({id:e.id,text:e.getLabel({long:!0}),model:e})),formatSelection:({model:e},t,i)=>i(e.getLabel())})},setUpLocationSelect2:function(){this.$id("location").select2({width:"250px",multiple:!0,placeholder:" ",data:n.locations.filter(e=>e.get("active")).map(e=>({id:e.id,text:e.getLabel({long:!0}),model:e})),formatSelection:({model:e},t,i)=>i(e.getLabel())})},destroy:function(){a.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")},filterHasValue:function(e){if("createdAt"===e){var t=this.$id("from-date"),i=this.$id("to-date");return t.val().length>0||i.val().length>0}return a.prototype.filterHasValue.apply(this,arguments)},showFilter:function(e){"_id"===e?t(".page-actions-jump").find(".form-control").focus():"creator"===e||"implementer"===e||"coordinator"===e?this.$id("user").select2("focus"):a.prototype.showFilter.apply(this,arguments)}})});