define(["underscore","app/i18n","app/viewport","app/router","../View","app/core/templates/actionForm"],function(e,t,o,r,i,s){"use strict";function n(e,o,r){return t.bound(t.has(e.nlsDomain,o)?e.nlsDomain:"core",o,r||{})}var a={formMethod:"POST",formAction:"/",formActionText:t.bound("core","ACTION_FORM:BUTTON"),formActionSeverity:"primary",messageText:t.bound("core","ACTION_FORM:MESSAGE"),successUrl:null,cancelUrl:"#",failureText:t.bound("core","ACTION_FORM:MESSAGE_FAILURE"),requestData:null},l=i.extend({template:s,events:{submit:"submitForm"},$errorMessage:null,initialize:function(){e.defaults(this.options,a),this.$errorMessage=null},destroy:function(){this.hideErrorMessage()},serialize:function(){return{formMethod:this.options.formMethod,formAction:this.options.formAction,formActionText:this.options.formActionText,formActionSeverity:this.options.formActionSeverity,messageText:this.options.messageText,cancelUrl:this.options.cancelUrl,model:this.model}},afterRender:function(){this.model&&this.listenToOnce(this.model,"change",this.render)},submitForm:function(){this.hideErrorMessage();var r=this.$('[type="submit"]').attr("disabled",!0),i=this.options,s=i.requestData;s=null==s?void 0:e.isFunction(s)?s.call(this):JSON.stringify(s);var n=this.ajax({type:i.formMethod,url:i.formAction,data:s}),a=this;return n.done(function(t){a.trigger("success",t),e.isString(i.successUrl)&&a.broker.publish("router.navigate",{url:i.successUrl,trigger:!0,replace:!0})}),n.fail(function(e){a.trigger("failure",e);var r=e.responseJSON&&e.responseJSON.error&&e.responseJSON.error.code||"?",s="ACTION_FORM:"+i.actionKey+":"+r,n=t.has(a.options.nlsDomain,s)?t(a.options.nlsDomain,s):i.failureText;n&&(a.$errorMessage=o.msg.show({type:"error",time:3e3,text:n}))}),n.always(function(){r.attr("disabled",!1)}),!1},hideErrorMessage:function(){null!==this.$errorMessage&&(o.msg.hide(this.$errorMessage),this.$errorMessage=null)}},{showDialog:function(t){var r=null;if(t.nlsDomain||(t.nlsDomain=t.model.getNlsDomain()),t.nlsDomain){r=n(t,"ACTION_FORM:DIALOG_TITLE:"+t.actionKey);var i=t.labelAttribute?t.model.get(t.labelAttribute):t.model.getLabel();t.messageText||(t.messageText=i?n(t,"ACTION_FORM:MESSAGE_SPECIFIC:"+t.actionKey,{label:i}):n(t,"ACTION_FORM:MESSAGE:"+t.actionKey)),t.formActionText||(t.formActionText=n(t,"ACTION_FORM:BUTTON:"+t.actionKey)),t.failureText||(t.failureText=n(t,"ACTION_FORM:MESSAGE_FAILURE:"+t.actionKey))}!t.formAction&&e.isFunction(t.model.url)&&(t.formAction=t.model.url()),e.isObject(t.requestData)||(t.requestData={}),e.isString(t.requestData.action)||(t.requestData.action=t.actionKey);var s=new l(t);return s.on("success",function(){o.closeDialog()}),o.showDialog(s,r),s},showDeleteDialog:function(e){return e.actionKey="delete",e.formMethod="DELETE",e.formActionSeverity="danger",l.showDialog(e)}});return l});