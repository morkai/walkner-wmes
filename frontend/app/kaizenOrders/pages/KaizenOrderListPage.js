// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/KaizenOrderFilterView',
  '../views/KaizenOrderListView'
], function(
  t,
  FilteredListPage,
  pageActions,
  kaizenDictionaries,
  KaizenOrderFilterView,
  KaizenOrderListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,
    FilterView: KaizenOrderFilterView,
    ListView: KaizenOrderListView,

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
