// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/XiconfComponentWeightListView',
  '../views/XiconfComponentWeightFilterView'
], function(
  t,
  FilteredListPage,
  XiconfComponentWeightListView,
  XiconfComponentWeightFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: XiconfComponentWeightFilterView,

    ListView: XiconfComponentWeightListView,

    breadcrumbs: [
      t.bound('xiconfComponentWeights', 'BREADCRUMB:base'),
      t.bound('xiconfComponentWeights', 'BREADCRUMB:browse')
    ]

  });
});
