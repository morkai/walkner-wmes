// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/core/views/PrintableListView","app/fte/templates/printableMasterEntryList","../util/fractions"],function(e,t,n,i){return t.extend({template:n,serialize:function(){return e.extend(this.model.serializeWithTotals(),{round:i.round})},afterRender:function(){}})});