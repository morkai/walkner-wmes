// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","../View","../views/FormView","./createPageBreadcrumbs"],function(e,t,i,o){"use strict";return t.extend({layoutName:"page",pageId:"addForm",baseBreadcrumb:!1,breadcrumbs:function(){return o(this,[":addForm"])},initialize:function(){var t=this.options.FormView||this.FormView||i,o={editMode:!1,model:this.model,formMethod:"POST",formAction:this.model.url(),formActionText:e(this.model.getNlsDomain(),"FORM:ACTION:add"),failureText:e(this.model.getNlsDomain(),"FORM:ERROR:addFailure"),panelTitleText:e(this.model.getNlsDomain(),"PANEL:TITLE:addForm")};"function"==typeof this.options.formTemplate&&(o.template=this.options.formTemplate),this.view=new t(o)}})});