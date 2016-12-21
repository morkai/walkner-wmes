// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/HeffLineStateFilterView',
  '../views/HeffLineStateListView'
], function(
  t,
  FilteredListPage,
  HeffLineStateFilterView,
  HeffLineStateListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: HeffLineStateFilterView,
    ListView: HeffLineStateListView,

    actions: null,

    breadcrumbs: [
      {href: '#hourlyPlans', label: t.bound('hourlyPlans', 'BREADCRUMBS:browse')},
      t.bound('hourlyPlans', 'BREADCRUMBS:heffLineStates')
    ]

  });
});
