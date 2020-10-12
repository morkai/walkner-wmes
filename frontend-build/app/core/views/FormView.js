define(["underscore","form2js","js2form","app/viewport","../Model","../View"],function(e,t,i,r,s,n){"use strict";return n.extend({events:{submit:"submitForm"},$errorMessage:null,updateOnChange:!0,initialize:function(){this.$errorMessage=null,this.model||(this.model=new s),this.listenTo(this.model,"change",function(){this.isRendered()&&this.updateOnChange&&i(this.el,this.serializeToForm(!0),".",null,!1,!1)})},destroy:function(){this.hideErrorMessage()},serialize:function(){var t=this.options;return e.assign(n.prototype.serialize.apply(this,arguments),{editMode:!!t.editMode,formMethod:t.formMethod,formAction:t.formAction,formActionText:t.formActionText,panelTitleText:t.panelTitleText,model:this.serializeModel()})},afterRender:function(){i(this.el,this.serializeToForm(!1))},serializeModel:function(){return this.model.toJSON()},serializeToForm:function(e){return this.model.serializeForm?this.model.serializeForm():this.model.toJSON()},serializeForm:function(e){return e},getFormData:function(){return this.serializeForm(t(this.el))},getSubmitButtons:function(){var e=this.$(".form-actions");return e.length||(e=this.$(".panel-footer")),e.find(".btn:not(.cancel)")},submitForm:function(){if(this.hideErrorMessage(),!this.el.checkValidity())return!1;var e=this.getFormData();if(!this.checkValidity(e))return this.handleInvalidity(e),!1;var t=this.getSubmitButtons().prop("disabled",!0);return this.submitRequest(t,e),!1},submitRequest:function(e,t){var i=this.request(t);i.done(this.handleSuccess.bind(this)),i.fail(this.handleFailure.bind(this)),i.always(function(){e.prop("disabled",!1)})},request:function(e){return this.promised(this.model.save(e,this.getSaveOptions()))},checkValidity:function(e){return!!e},handleInvalidity:function(){},handleSuccess:function(){"function"==typeof this.options.done?this.options.done(!0):this.broker&&this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!0})},handleFailure:function(e){this.showErrorMessage(this.getFailureText(e))},getFailureText:function(){return this.options.failureText||this.t("core","MSG:SAVING_FAILURE")},showErrorMessage:function(e){return this.hideErrorMessage(),this.$errorMessage=r.msg.show({type:"error",time:3e3,text:e}),!1},hideErrorMessage:function(){null!==this.$errorMessage&&(r.msg.hide(this.$errorMessage),this.$errorMessage=null)},getSaveOptions:function(){return{wait:!0}}})});