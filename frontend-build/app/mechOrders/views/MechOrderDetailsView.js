// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/views/DetailsView","app/mechOrders/templates/details"],function(e,t,i){"use strict";return t.extend({template:i,serialize:function(){return{model:this.model.toJSON(),panelType:this.options.panelType||"primary",panelTitle:this.options.panelTitle||e("mechOrders","PANEL:TITLE:details")}}})});