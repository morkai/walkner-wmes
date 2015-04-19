// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/util/pageActions","app/core/pages/FilteredListPage","../views/XiconfOrderListView","../views/XiconfOrderFilterView"],function(e,i,r,n,t){"use strict";return r.extend({FilterView:t,ListView:n,breadcrumbs:function(){return[e.bound("xiconfOrders","BREADCRUMBS:base"),e.bound("xiconfOrders","BREADCRUMBS:browse")]},actions:function(r){return[i["export"](r,this,this.collection),{label:e.bound("xiconfOrders","PAGE_ACTION:settings"),icon:"cogs",privileges:"XICONF:MANAGE",href:"#xiconf;settings?tab=notifier"}]}})});