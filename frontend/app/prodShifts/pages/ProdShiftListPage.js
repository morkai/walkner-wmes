// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/users/ownMrps',
  '../views/ProdShiftListView',
  '../views/ProdShiftFilterView'
], function(
  user,
  pageActions,
  FilteredListPage,
  ownMrps,
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
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}), ownMrps.load(this));
    }

  });
});
