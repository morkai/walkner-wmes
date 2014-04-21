// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time","app/viewport","app/core/views/FormView","app/data/prodLines","app/users/util/setUpUserSelect2","app/prodShifts/templates/form"],function(e,t,r,i,s,a,o){return i.extend({template:o,idPrefix:"prodShiftForm",destroy:function(){this.$('.select2-offscreen[tabindex="-1"]').select2("destroy")},afterRender:function(){i.prototype.afterRender.call(this),this.setUpProdLineField(),this.setUpUserSelect2("master"),this.setUpUserSelect2("leader"),this.setUpUserSelect2("operator"),this.options.editMode&&(this.$id("date").attr("disabled",!0),this.$('input[name="shift"]').attr("disabled",!0))},setUpProdLineField:function(){this.options.editMode?this.$id("prodLine").addClass("form-control").attr("disabled",!0):this.$id("prodLine").select2({data:s.map(function(e){return{id:e.id,text:e.getLabel()}})})},setUpUserSelect2:function(e){var t=a(this.$id(e)),r=this.model.get(e);r&&r.id&&r.label&&t.select2("data",{id:r.id,text:r.label})},serializeToForm:function(){var e=this.model.toJSON();return e.date=t.format(e.date,"YYYY-MM-DD"),e},serializeForm:function(e){return this.options.editMode||(e.shift=parseInt(e.shift,10)),e.master=this.serializeUserInfo("master"),e.leader=this.serializeUserInfo("leader"),e.operator=this.serializeUserInfo("operator"),e.operators=e.operator?[e.operator]:[],e.quantitiesDone=e.quantitiesDone.map(function(e){return{planned:parseInt(e.planned,10),actual:parseInt(e.actual,10)}}),e},serializeUserInfo:function(e){var t=this.$id(e).select2("data");return null===t?null:{id:t.id,label:t.text}},handleFailure:function(t){t.responseJSON&&t.responseJSON.error&&e.has("prodShifts","FORM:ERROR:"+t.responseJSON.error.message)?this.$errorMessage=r.msg.show({type:"warning",time:5e3,text:e("prodShifts","FORM:ERROR:"+t.responseJSON.error.message)}):i.prototype.handleFailure.apply(this,arguments)}})});