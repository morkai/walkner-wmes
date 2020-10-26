// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/FilterView',
  '../views/ListView',
  'app/wmes-compRel-entries/templates/exportAction'
], function(
  FilteredListPage,
  pageActions,
  FilterView,
  ListView,
  exportActionTemplate
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    actions: function(layout)
    {
      var page = this;

      return [
        pageActions.jump(page, page.collection),
        pageActions.export({
          layout: layout,
          page: page,
          collection: page.collection,
          privilege: false,
          template: exportActionTemplate
        }),
        pageActions.add(page.collection),
        {
          label: page.t('PAGE_ACTION:funcs'),
          icon: 'users',
          privileges: 'COMP_REL:MANAGE',
          href: '#compRel/funcs'
        },
        {
          label: page.t('PAGE_ACTION:reasons'),
          icon: 'question',
          privileges: 'COMP_REL:MANAGE',
          href: '#compRel/reasons'
        }
        /*
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'COMP_REL:MANAGE',
          href: '#compRel/settings',
          disabled: true
        }
        */
      ];
    }

  });
});
