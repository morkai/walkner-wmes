// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/XiconfHidLampListView',
  '../views/XiconfHidLampFilterView'
], function(
  t,
  FilteredListPage,
  pageActions,
  XiconfHidLampListView,
  XiconfHidLampFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: XiconfHidLampFilterView,

    ListView: XiconfHidLampListView,

    actions: function()
    {
      return [pageActions.add(this.collection, ['XICONF:MANAGE', 'XICONF:MANAGE:HID_LAMPS'])];
    },

    breadcrumbs: [
      t.bound('xiconfHidLamps', 'BREADCRUMB:base'),
      t.bound('xiconfHidLamps', 'BREADCRUMB:browse')
    ]

  });
});
