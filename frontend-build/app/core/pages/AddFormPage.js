// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","../View","../views/FormView","./createPageBreadcrumbs"],function(e,i,t,o){"use strict";return i.extend({layoutName:"page",pageId:"addForm",baseBreadcrumb:!1,breadcrumbs:function(){return o(this,[":addForm"])},initialize:function(){this.defineModels(),this.defineViews()},defineModels:function(){},defineViews:function(){var e=this.getFormViewClass();this.view=new e(this.getFormViewOptions())},getFormViewClass:function(){return this.options.FormView||this.FormView||t},getFormViewOptions:function(){var i=this.model,t={editMode:!1,model:i,formMethod:"POST",formAction:i.url(),formActionText:e(i.getNlsDomain(),"FORM:ACTION:add"),failureText:e(i.getNlsDomain(),"FORM:ERROR:addFailure"),panelTitleText:e(i.getNlsDomain(),"PANEL:TITLE:addForm")};return"function"==typeof this.options.formTemplate&&(t.template=this.options.formTemplate),t}})});