// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
