// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/data/aors","app/data/downtimeReasons","app/data/views/OrgUnitDropdownsView","app/core/views/FormView","app/core/util/idAndLabel","app/subdivisions/templates/form"],function(e,t,i,o,a,s){"use strict";return o.extend({template:s,initialize:function(){o.prototype.initialize.call(this),this.orgUnitDropdownsView=new i({orgUnit:i.ORG_UNIT.DIVISION,required:!0}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},afterRender:function(){o.prototype.afterRender.call(this);var i=this.orgUnitDropdownsView;this.listenToOnce(i,"afterRender",function(){i.selectValue(this.model).focus(),i.$id("division").select2("enable",!this.options.editMode)}),this.$id("prodTaskTags").select2({tags:this.model.allTags||[],tokenSeparators:[","]}),this.$id("aor").select2({allowClear:!0,data:e.map(a)}),this.$id("autoDowntime").select2({placeholder:" ",allowClear:!0,data:t.map(a)})},serializeToForm:function(){var e=this.model.toJSON();return e.prodTaskTags=e.prodTaskTags?e.prodTaskTags.join(","):"",e},serializeForm:function(i){return i.prodTaskTags="string"==typeof i.prodTaskTags?i.prodTaskTags.split(","):[],i.aor=e.get(i.aor)?i.aor:null,i.autoDowntime=t.get(i.autoDowntime)?i.autoDowntime:null,i}})});