define(["underscore","app/i18n","app/viewport","app/core/views/FormView","app/users/util/setUpUserSelect2","app/prodShifts/templates/editForm"],function(e,t,r,s,i,a){return s.extend({template:a,idPrefix:"prodShiftEditForm",afterRender:function(){s.prototype.afterRender.call(this),this.setUpUserSelect2("master"),this.setUpUserSelect2("leader"),this.setUpUserSelect2("operator")},setUpUserSelect2:function(e){var t=i(this.$id(e)),r=this.model.get(e);r&&r.id&&r.label&&t.select2("data",{id:r.id,text:r.label})},serializeForm:function(e){return e.master=this.serializeUserInfo("master"),e.leader=this.serializeUserInfo("leader"),e.operator=this.serializeUserInfo("operator"),e.operators=e.operator?[e.operator]:[],e.quantitiesDone=e.quantitiesDone.map(function(e){return{planned:parseInt(e.planned,10),actual:parseInt(e.actual,10)}}),e},serializeUserInfo:function(e){var t=this.$id(e).select2("data");return null===t?null:{id:t.id,label:t.text}},handleFailure:function(e){e.responseJSON&&e.responseJSON.error&&"INVALID_CHANGES"===e.responseJSON.error.message?this.$errorMessage=r.msg.show({type:"warning",time:5e3,text:t("prodShifts","FORM:ERROR:INVALID_CHANGES")}):s.prototype.handleFailure.apply(this,arguments)}})});