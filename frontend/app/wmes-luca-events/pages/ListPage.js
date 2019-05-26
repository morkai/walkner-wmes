// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/FilterView',
  '../views/ListView'
], function(
  FilteredListPage,
  pageActions,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,

    FilterView: FilterView,
    ListView: ListView,

    actions: function(layout)
    {
      var collection = this.collection;

      return [
        pageActions.export(layout, this, collection, false)
      ];
    }

  });
});
