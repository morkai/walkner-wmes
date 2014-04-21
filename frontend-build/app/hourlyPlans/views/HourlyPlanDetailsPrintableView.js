// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/PrintableListView","app/hourlyPlans/templates/printableList"],function(e,t){return e.extend({template:t,serialize:function(){return this.model.serialize()},afterRender:function(){}})});