define(["underscore","app/i18n","../util/bindLoadingMessage","../View","../views/ActionFormView","./createPageBreadcrumbs"],function(e,t,i,o,n,s){"use strict";return o.extend({layoutName:"page",baseBreadcrumb:!1,breadcrumbs:function(){return s(this,[{label:this.model.getLabel(),href:this.model.genClientUrl()},":ACTION_FORM:"+this.options.actionKey])},initialize:function(){this.model=i(this.options.model,this);var o=this.model.getNlsDomain(),s=this.options.actionKey;this.view=new n(e.defaults({model:this.model},this.options,{formActionText:t.bound(o,"ACTION_FORM:BUTTON:"+s),messageText:t.bound(o,"ACTION_FORM:MESSAGE:"+s),failureText:t.bound(o,"ACTION_FORM:MESSAGE_FAILURE:"+s),requestData:{action:s}}))},load:function(e){return e(this.model.fetch())}})});