// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/XiconfProgramOrderListView',
  '../views/XiconfProgramOrderFilterView'
], function(
  pageActions,
  FilteredListPage,
  XiconfProgramOrderListView,
  XiconfProgramOrderFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: XiconfProgramOrderFilterView,
    ListView: XiconfProgramOrderListView,

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this, this.collection)
      ];
    }

  });
});
