// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/core/views/PrintableListView","app/fte/templates/printableLeaderEntryList","./fractionsUtil"],function(e,t,n,i,r){return n.extend({template:i,serialize:function(){return e.extend(this.model.serializeWithTotals(),{round:r.round})},afterRender:function(){}})});