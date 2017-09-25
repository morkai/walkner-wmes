// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/EditFormPage","app/planning/views/PlanSettingsView"],function(e,n,t){"use strict";return n.extend({baseBreadcrumb:!0,FormView:t,breadcrumbs:function(){return[{label:e.bound("planning","BREADCRUMBS:base"),href:"#planning/plans"},{label:this.model.getLabel(),href:"#planning/plans/"+this.model.id},{label:e.bound("planning","BREADCRUMBS:settings")}]},getFormViewOptions:function(){var n=this.model,t=n.getNlsDomain();return{editMode:!0,model:n,formMethod:"PUT",formAction:n.url(),formActionText:e(t,"settings:submit"),failureText:e(t,"settings:editFailure"),panelTitleText:e(t,"settings:title")}}})});