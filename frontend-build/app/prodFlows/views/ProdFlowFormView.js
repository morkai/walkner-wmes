define(["app/data/views/OrgUnitDropdownsView","app/core/views/FormView","app/prodFlows/templates/form","i18n!app/nls/prodFlows"],function(e,i,o){return i.extend({template:o,idPrefix:"prodFlowForm",initialize:function(){i.prototype.initialize.call(this),this.orgUnitDropdownsView=new e({orgUnit:e.ORG_UNIT.MRP_CONTROLLER,multiple:!0}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){i.prototype.afterRender.call(this),this.listenToOnce(this.orgUnitDropdownsView,"afterRender",function(){this.orgUnitDropdownsView.selectValue(this.model).focus()})},serializeForm:function(e){return e.mrpController="string"==typeof e.mrpController?e.mrpController.split(","):[],e}})});