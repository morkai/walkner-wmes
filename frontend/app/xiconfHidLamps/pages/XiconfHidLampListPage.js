// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/XiconfHidLampListView',
  '../views/XiconfHidLampFilterView'
], function(
  t,
  FilteredListPage,
  XiconfHidLampListView,
  XiconfHidLampFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: XiconfHidLampFilterView,

    ListView: XiconfHidLampListView,

    breadcrumbs: [
      t.bound('xiconfHidLamps', 'BREADCRUMBS:base'),
      t.bound('xiconfHidLamps', 'BREADCRUMBS:browse')
    ]

  });
});
