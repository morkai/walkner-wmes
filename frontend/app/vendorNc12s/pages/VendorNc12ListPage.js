// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  '../views/VendorNc12FilterView',
  '../views/VendorNc12ListView'
], function(
  FilteredListPage,
  VendorNc12FilterView,
  VendorNc12ListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: VendorNc12FilterView,
    ListView: VendorNc12ListView

  });
});
