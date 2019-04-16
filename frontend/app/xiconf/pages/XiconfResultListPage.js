// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/xiconf/views/XiconfResultFilterView',
  'app/xiconf/views/XiconfResultListView'
], function(
  pageActions,
  FilteredListPage,
  XiconfResultFilterView,
  XiconfResultListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,
    FilterView: XiconfResultFilterView,
    ListView: XiconfResultListView,

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this, this.collection)
      ];
    }

  });
});
