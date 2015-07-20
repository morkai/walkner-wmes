// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/user',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/ProdShiftListView',
  '../views/ProdShiftFilterView'
], function(
  user,
  pageActions,
  FilteredListPage,
  ProdShiftListView,
  ProdShiftFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: ProdShiftFilterView,
    ListView: ProdShiftListView,

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this, this.collection),
        pageActions.add(
          this.collection,
          user.isAllowedTo.bind(user, 'PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST')
        )
      ];
    }

  });
});
