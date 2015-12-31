// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  '../views/ProdDowntimeAlertFilterView',
  '../views/ProdDowntimeAlertListView'
], function(
  FilteredListPage,
  ProdDowntimeAlertFilterView,
  ProdDowntimeAlertListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: '#prodDowntimes',

    FilterView: ProdDowntimeAlertFilterView,
    ListView: ProdDowntimeAlertListView

  });
});
