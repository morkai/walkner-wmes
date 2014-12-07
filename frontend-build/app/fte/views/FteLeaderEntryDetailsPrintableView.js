// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/core/views/PrintableListView","app/fte/templates/printableLeaderEntryListWoFunctions","app/fte/templates/printableLeaderEntryListWFunctions","../util/fractions"],function(e,t,n,i,r){return t.extend({template:function(e){return null===e.totalByProdFunction?n(e):i(e)},serialize:function(){return e.extend(this.model.serializeWithTotals(),{round:r.round})},afterRender:function(){}})});