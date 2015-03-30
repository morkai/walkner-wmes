// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
