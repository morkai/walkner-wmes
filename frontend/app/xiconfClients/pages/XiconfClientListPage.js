// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/XiconfClientListView',
  '../views/XiconfClientFilterView'
], function(
  t,
  FilteredListPage,
  XiconfClientListView,
  XiconfClientFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: XiconfClientFilterView,
    ListView: XiconfClientListView,

    breadcrumbs: function()
    {
      return [
        t.bound('xiconfClients', 'BREADCRUMBS:base'),
        t.bound('xiconfClients', 'BREADCRUMBS:browse')
      ];
    },

    actions: function()
    {
      return [];
    }

  });
});
