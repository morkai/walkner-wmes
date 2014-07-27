// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/data/views/OrgUnitDropdownsView","app/core/views/FormView","app/prodLines/templates/form"],function(e,t,i){return t.extend({template:i,initialize:function(){t.prototype.initialize.call(this),this.orgUnitDropdownsView=new e({orgUnit:e.ORG_UNIT.WORK_CENTER}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){t.prototype.afterRender.call(this),this.options.editMode&&this.$(".form-control[name=_id]").attr("readonly",!0),this.listenToOnce(this.orgUnitDropdownsView,"afterRender",function(){this.orgUnitDropdownsView.selectValue(this.model).focus()})},serializeForm:function(e){return e.workCenter||(e.workCenter=null),e.inventoryNo||(e.inventoryNo=null),e}})});