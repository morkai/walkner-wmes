// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/pages/EditFormPage","../views/ProdDowntimeFormView"],function(e,o,r){return o.extend({FormView:r,breadcrumbs:function(){return[{label:e.bound("prodDowntimes","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},{label:this.model.getLabel(),href:this.model.genClientUrl()},e.bound("prodDowntimes","BREADCRUMBS:editForm")]}})});