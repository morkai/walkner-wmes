// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/PfepEntryFilterView',
  '../views/PfepEntryListView'
], function(
  $,
  FilteredListPage,
  pageActions,
  PfepEntryFilterView,
  PfepEntryListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,
    FilterView: PfepEntryFilterView,
    ListView: PfepEntryListView,

    actions: function(layout)
    {
      var collection = this.collection;

      return [
        pageActions.jump(this, collection),
        pageActions.export(layout, this, collection, false),
        pageActions.add(collection)
      ];
    }

  });
});
