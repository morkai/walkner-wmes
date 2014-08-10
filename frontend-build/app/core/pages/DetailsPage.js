// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","../util/bindLoadingMessage","../util/pageActions","../View","../views/DetailsView"],function(e,i,t,s,n){return s.extend({layoutName:"page",pageId:"details",modelProperty:"model",breadcrumbs:function(){var i=this[this.modelProperty];return[{label:e.bound(i.nlsDomain,"BREADCRUMBS:browse"),href:i.genClientUrl("base")},i.getLabel()]},actions:function(){var e=this[this.modelProperty];return[t.edit(e,e.privilegePrefix+":MANAGE"),t.delete(e,e.privilegePrefix+":MANAGE")]},initialize:function(){this.defineModels(),this.defineViews()},defineModels:function(){this[this.modelProperty]=i(this.options.model,this)},defineViews:function(){var e=this.DetailsView||n,i={model:this[this.modelProperty]};"function"==typeof this.detailsTemplate&&(i.template=this.detailsTemplate),"function"==typeof this.serializeDetails&&(i.serializeDetails=this.serializeDetails),this.view=new e(i)},load:function(e){return e(this[this.modelProperty].fetch(this.fetchOptions))}})});