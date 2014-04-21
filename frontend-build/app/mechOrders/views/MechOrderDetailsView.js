// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/DetailsView","app/mechOrders/templates/details"],function(e,t,i){return t.extend({template:i,serialize:function(){return{model:this.model.toJSON(),panelType:this.options.panelType||"primary",panelTitle:this.options.panelTitle||e("mechOrders","PANEL:TITLE:details")}}})});