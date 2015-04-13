// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/pages/FilteredListPage","../views/XiconfClientListView","../views/XiconfClientFilterView"],function(e,i,n,t){"use strict";return i.extend({FilterView:t,ListView:n,breadcrumbs:function(){return[e.bound("xiconfClients","BREADCRUMBS:base"),e.bound("xiconfClients","BREADCRUMBS:browse")]},actions:function(){return[]}})});