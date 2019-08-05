// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  '../views/OrderDocumentConfirmationListView',
  '../views/OrderDocumentConfirmationFilterView'
], function(
  FilteredListPage,
  OrderDocumentConfirmationListView,
  OrderDocumentConfirmationFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,

    FilterView: OrderDocumentConfirmationFilterView,
    ListView: OrderDocumentConfirmationListView,

    actions: []

  });
});
