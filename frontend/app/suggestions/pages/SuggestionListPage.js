// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
        pageActions.export(layout, this, this.collection, false),
        {
          label: t.bound(collection.getNlsDomain(), 'PAGE_ACTION:add'),
          icon: 'plus',
          href: collection.genClientUrl('add')
        }
      ];
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}), kaizenDictionaries.load());
    },

    destroy: function()
    {
      FilteredListPage.prototype.destroy.call(this);

      kaizenDictionaries.unload();
    },

    afterRender: function()
    {
      FilteredListPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();
    }

  });
});
