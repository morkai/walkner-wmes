// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/FilteredListPage","../views/PlanListFilterView","../views/PlanListView"],function(e,i,n,t){"use strict";return i.extend({FilterView:n,ListView:t,actions:[],breadcrumbs:function(){return[e.bound("planning","BREADCRUMBS:base")]}})});