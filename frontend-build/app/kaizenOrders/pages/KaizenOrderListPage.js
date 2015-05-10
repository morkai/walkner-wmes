// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/pages/FilteredListPage","app/core/util/pageActions","../dictionaries","../views/KaizenOrderFilterView","../views/KaizenOrderListView"],function(e,i,t,n,r,o){"use strict";return i.extend({baseBreadcrumb:!0,FilterView:r,ListView:o,actions:function(){var i=this.collection;return[{label:e.bound(i.getNlsDomain(),"PAGE_ACTION:add"),icon:"plus",href:i.genClientUrl("add")}]},load:function(e){return e(this.collection.fetch({reset:!0}),n.load())},destroy:function(){i.prototype.destroy.call(this),n.unload()}})});