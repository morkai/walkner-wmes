// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/FilterView',
  '../views/ListView'
], function(
  FilteredListPage,
  pageActions,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    actions: function()
    {
      var page = this;

      return [
        pageActions.jump(page, page.collection),
        pageActions.add(page.collection),
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'COMP_REL:MANAGE',
          href: '#compRel/settings',
          disabled: true
        }
      ];
    }

  });
});
