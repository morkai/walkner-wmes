define(["app/data/views/OrgUnitDropdownsView","app/core/views/FormView","app/workCenters/templates/form","i18n!app/nls/workCenters"],function(e,t,o){return t.extend({template:o,initialize:function(){t.prototype.initialize.call(this),this.orgUnitDropdownsView=new e({orgUnit:e.ORG_UNIT.PROD_FLOW}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){t.prototype.afterRender.call(this),this.options.editMode&&this.$(".form-control[name=_id]").attr("readonly",!0),this.listenToOnce(this.orgUnitDropdownsView,"afterRender",function(){this.orgUnitDropdownsView.selectValue(this.model).focus()})},serializeForm:function(e){return e.prodFlow?e.mrpController=null:e.prodFlow=null,e}})});