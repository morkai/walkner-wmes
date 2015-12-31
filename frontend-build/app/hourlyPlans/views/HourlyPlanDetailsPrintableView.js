// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/PrintableListView","app/hourlyPlans/templates/printableList"],function(e,t){"use strict";return e.extend({template:t,serialize:function(){return this.model.serialize()},afterRender:function(){}})});