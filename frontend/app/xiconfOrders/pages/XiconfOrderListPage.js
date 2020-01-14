// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
        t.bound('xiconfOrders', 'BREADCRUMB:base'),
        t.bound('xiconfOrders', 'BREADCRUMB:browse')
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
