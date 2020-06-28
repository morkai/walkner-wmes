define(["app/core/views/FormView","app/core/util/idAndLabel","app/data/orgUnits","app/users/util/setUpUserSelect2","app/kaizenSections/templates/form"],function(i,e,o,t,s){"use strict";return i.extend({template:s,serializeToForm:function(){var i=this.model.toJSON();return i.subdivisions=Array.isArray(i.subdivisions)?i.subdivisions.join(","):"",i.confirmers="",i.coordinators="",i},serializeForm:function(i){return i.subdivisions=i.subdivisions?i.subdivisions.split(","):[],i.confirmers=t.getUserInfo(this.$id("confirmers"))||[],i.coordinators=t.getUserInfo(this.$id("coordinators"))||[],i},afterRender:function(){var e=this;i.prototype.afterRender.call(e),e.options.editMode&&(e.$id("id").prop("readonly",!0),e.$id("name").focus()),e.$id("subdivisions").select2({allowClear:!0,multiple:!0,data:o.getAllByType("subdivision").map(function(i){return{id:i.id,text:i.get("division")+" \\ "+i.get("name")}})}),["confirmers","coordinators"].forEach(function(i){t(e.$id(i),{multiple:!0,noPersonnelId:!0}).select2("data",(e.model.get(i)||[]).map(function(i){return{id:i.id,text:i.label}}))})}})});