// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/XiconfProgramListView',
  '../views/XiconfProgramFilterView'
], function(
  t,
  FilteredListPage,
  XiconfProgramListView,
  XiconfProgramFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: XiconfProgramFilterView,

    ListView: XiconfProgramListView,

    breadcrumbs: [
      t.bound('xiconfPrograms', 'BREADCRUMBS:base'),
      t.bound('xiconfPrograms', 'BREADCRUMBS:browse')
    ]

  });
});
