// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/data/views/OrgUnitDropdownsView","app/core/views/FormView","app/workCenters/templates/form"],function(e,t,i,o){return i.extend({template:o,initialize:function(){i.prototype.initialize.call(this),this.orgUnitDropdownsView=new t({orgUnit:t.ORG_UNIT.PROD_FLOW}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){i.prototype.afterRender.call(this);var e=this.options.editMode;e&&this.$id("_id").attr("readonly",!0);var t=this.orgUnitDropdownsView;this.listenToOnce(t,"afterRender",function(){t.selectValue(this.model).focus(),t.$id("division").select2("enable",!e),t.$id("subdivision").select2("enable",!e)})},serializeToForm:function(){var t=i.prototype.serializeToForm.call(this);return t.deactivatedAt&&(t.deactivatedAt=e.format(t.deactivatedAt,"YYYY-MM-DD")),t},serializeForm:function(t){var i=e.getMoment(t.deactivatedAt||null);return t.deactivatedAt=i.isValid()?i.toISOString():null,t.prodFlow?t.mrpController=null:t.prodFlow=null,t}})});