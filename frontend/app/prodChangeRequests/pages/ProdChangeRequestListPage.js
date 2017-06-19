// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/ProdChangeRequestListView',
  '../views/ProdChangeRequestFilterView'
], function(
  t,
  pageActions,
  FilteredListPage,
  ProdChangeRequestListView,
  ProdChangeRequestFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: ProdChangeRequestFilterView,
    ListView: ProdChangeRequestListView,

    actions: []

  });
});
