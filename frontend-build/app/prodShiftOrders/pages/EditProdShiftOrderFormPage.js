// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/time","app/core/pages/EditFormPage","../views/ProdShiftOrderFormView"],function(e,r,i,t){"use strict";return i.extend({FormView:t,breadcrumbs:function(){return[{label:e.bound("prodShiftOrders","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},{label:this.model.getLabel(),href:this.model.genClientUrl()},e.bound("prodShiftOrders","BREADCRUMBS:editForm")]}})});