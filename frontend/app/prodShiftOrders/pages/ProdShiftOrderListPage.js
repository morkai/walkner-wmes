// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/ProdShiftOrderFilterView',
  '../views/ProdShiftOrderListView'
], function(
  t,
  pageActions,
  FilteredListPage,
  ProdShiftOrderFilterView,
  ProdShiftOrderListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: ProdShiftOrderFilterView,
    ListView: ProdShiftOrderListView,

    pageId: 'prodShiftOrderList',

    breadcrumbs: [
      t.bound('prodShiftOrders', 'BREADCRUMBS:browse')
    ],

    actions: function(layout)
    {
      return [pageActions.export(layout, this, this.collection)];
    }

  });
});
