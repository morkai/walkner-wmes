// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/PrintableListView","app/fte/templates/printableMasterEntryList","../util/fractions"],function(e,t,i,n){"use strict";return t.extend({template:i,serialize:function(){return e.extend(this.model.serializeWithTotals(),{round:n.round})},afterRender:function(){}})});