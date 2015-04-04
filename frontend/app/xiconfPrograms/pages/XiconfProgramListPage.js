// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
