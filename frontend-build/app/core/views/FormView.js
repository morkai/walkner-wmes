// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","form2js","js2form","app/viewport","../View"],function(e,t,i,s,r){"use strict";return r.extend({events:{submit:"submitForm"},$errorMessage:null,updateOnChange:!0,initialize:function(){this.$errorMessage=null,this.listenTo(this.model,"change",function(){this.isRendered()&&this.updateOnChange&&i(this.el,this.serializeToForm(!0),".",null,!1,!1)})},destroy:function(){this.hideErrorMessage()},serialize:function(){return{editMode:!!this.options.editMode,idPrefix:this.idPrefix,formMethod:this.options.formMethod,formAction:this.options.formAction,formActionText:this.options.formActionText,panelTitleText:this.options.panelTitleText,model:this.model.toJSON()}},afterRender:function(){i(this.el,this.serializeToForm(!1))},serializeToForm:function(e){return this.model.toJSON()},serializeForm:function(e){return e},getFormData:function(){return this.serializeForm(t(this.el))},submitForm:function(){if(this.hideErrorMessage(),!this.el.checkValidity())return!1;var e=this.getFormData();if(!this.checkValidity(e))return this.handleInvalidity(e),!1;var t=this.$('[type="submit"]').attr("disabled",!0);return this.submitRequest(t,e),!1},submitRequest:function(e,t){var i=this.request(t);i.done(this.handleSuccess.bind(this)),i.fail(this.handleFailure.bind(this)),i.always(function(){e.attr("disabled",!1)})},request:function(e){return this.promised(this.model.save(e,this.getSaveOptions()))},checkValidity:function(e){return!!e},handleInvalidity:function(){},handleSuccess:function(){"function"==typeof this.options.done?this.options.done(!0):this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!0})},handleFailure:function(){this.showErrorMessage(this.getFailureText())},getFailureText:function(){return this.options.failureText},showErrorMessage:function(e){return this.hideErrorMessage(),this.$errorMessage=s.msg.show({type:"error",time:3e3,text:e}),!1},hideErrorMessage:function(){null!==this.$errorMessage&&(s.msg.hide(this.$errorMessage),this.$errorMessage=null)},getSaveOptions:function(){return{wait:!0}}})});