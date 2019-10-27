// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/ProdShiftOrderFilterView',
  '../views/ProdShiftOrderListView'
], function(
  pageActions,
  FilteredListPage,
  ProdShiftOrderFilterView,
  ProdShiftOrderListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: ProdShiftOrderFilterView,
    ListView: ProdShiftOrderListView,

    actions: function(layout)
    {
      return [pageActions.export(layout, this, this.collection)];
    }

  });
});
