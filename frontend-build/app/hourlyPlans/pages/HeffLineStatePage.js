// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/FilteredListPage","../views/HeffLineStateFilterView","../views/HeffLineStateListView"],function(e,i,t,n){"use strict";return i.extend({FilterView:t,ListView:n,actions:null,breadcrumbs:[{href:"#hourlyPlans",label:e.bound("hourlyPlans","BREADCRUMBS:browse")},e.bound("hourlyPlans","BREADCRUMBS:heffLineStates")]})});