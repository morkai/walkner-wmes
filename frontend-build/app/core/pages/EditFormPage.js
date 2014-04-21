// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","../util/bindLoadingMessage","../View","../views/FormView"],function(e,t,i,o){return i.extend({layoutName:"page",pageId:"editForm",breadcrumbs:function(){return[{label:e.bound(this.model.getNlsDomain(),"BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},{label:this.model.getLabel(),href:this.model.genClientUrl()},e.bound(this.model.getNlsDomain(),"BREADCRUMBS:editForm")]},initialize:function(){this.model=t(this.options.model,this);var i=this.options.FormView||this.FormView||o,l={editMode:!0,model:this.model,formMethod:"PUT",formAction:this.model.url(),formActionText:e(this.model.getNlsDomain(),"FORM:ACTION:edit"),failureText:e(this.model.getNlsDomain(),"FORM:ERROR:editFailure"),panelTitleText:e(this.model.getNlsDomain(),"PANEL:TITLE:editForm")};"function"==typeof this.options.formTemplate&&(l.template=this.options.formTemplate),this.view=new i(l)},load:function(e){return e(this.model.fetch(this.options.fetchOptions))}})});