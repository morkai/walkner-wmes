define(["app/data/views/OrgUnitDropdownsView","app/core/views/FormView","app/prodLines/templates/form"],function(e,t,n){return t.extend({template:n,initialize:function(){t.prototype.initialize.call(this),this.orgUnitDropdownsView=new e({orgUnit:e.ORG_UNIT.WORK_CENTER}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){t.prototype.afterRender.call(this),this.options.editMode&&this.$(".form-control[name=_id]").attr("readonly",!0),this.listenToOnce(this.orgUnitDropdownsView,"afterRender",function(){this.orgUnitDropdownsView.selectValue(this.model).focus()})},serializeForm:function(e){return e.workCenter||(e.workCenter=null),e}})});