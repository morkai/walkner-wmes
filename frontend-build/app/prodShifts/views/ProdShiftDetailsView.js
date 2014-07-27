// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/DetailsView","app/prodShifts/templates/details"],function(t,e){return t.extend({template:e,initialize:function(){this.editing=!1},serialize:function(){var t={planned:0,actual:0};return this.model.get("quantitiesDone").forEach(function(e){t.planned+=e.planned,t.actual+=e.actual}),{editing:this.editing,model:this.model.serialize({orgUnits:!0,personnel:!0}),totalQuantityDone:t}},afterRender:function(){t.prototype.afterRender.call(this),this.editing&&this.setUpEditing()},setUpEditing:function(){}})});