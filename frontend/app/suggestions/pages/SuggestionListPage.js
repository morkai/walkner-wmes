// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  'app/kaizenOrders/dictionaries',
  '../views/SuggestionFilterView',
  '../views/SuggestionListView'
], function(
  t,
  FilteredListPage,
  pageActions,
  kaizenDictionaries,
  SuggestionFilterView,
  SuggestionListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,
    FilterView: SuggestionFilterView,
    ListView: SuggestionListView,

    actions: function(layout)
    {
      var collection = this.collection;

      return [
        pageActions.jump(this, collection),
        pageActions.export(layout, this, collection, false),
        pageActions.add(collection, false),
        {
          label: this.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'KAIZEN:DICTIONARIES:MANAGE',
          href: '#kaizenOrders;settings'
        }
      ];
    },

    initialize: function()
    {
      FilteredListPage.prototype.initialize.apply(this, arguments);

      kaizenDictionaries.bind(this);
    }

  });
});
