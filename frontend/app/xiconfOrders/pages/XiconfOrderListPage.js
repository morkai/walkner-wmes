// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/XiconfOrderListView',
  '../views/XiconfOrderFilterView'
], function(
  t,
  pageActions,
  FilteredListPage,
  XiconfOrderListView,
  XiconfOrderFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: XiconfOrderFilterView,
    ListView: XiconfOrderListView,

    breadcrumbs: function()
    {
      return [
        t.bound('xiconfOrders', 'BREADCRUMBS:base'),
        t.bound('xiconfOrders', 'BREADCRUMBS:browse')
      ];
    },

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this, this.collection), {
          label: t.bound('xiconfOrders', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'XICONF:MANAGE',
          href: '#xiconf;settings?tab=notifier'
        }
      ];
    }

  });
});
