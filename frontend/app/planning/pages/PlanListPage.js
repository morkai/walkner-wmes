// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/PlanListFilterView',
  '../views/PlanListView'
], function(
  t,
  FilteredListPage,
  PlanListFilterView,
  PlanListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: PlanListFilterView,
    ListView: PlanListView,

    actions: [],

    breadcrumbs: function()
    {
      return [t.bound('planning', 'BREADCRUMB:base')];
    }

  });
});
