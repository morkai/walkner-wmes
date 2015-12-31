// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/AddFormPage","../views/ProdShiftFormView"],function(e,r,o){"use strict";return r.extend({FormView:o,breadcrumbs:function(){return[{label:e.bound("prodShifts","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},e.bound("prodShifts","BREADCRUMBS:addForm")]}})});