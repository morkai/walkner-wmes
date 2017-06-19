// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/D8EntryFilterView',
  '../views/D8EntryListView'
], function(
  t,
  FilteredListPage,
  pageActions,
  dictionaries,
  D8EntryFilterView,
  D8EntryListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,
    FilterView: D8EntryFilterView,
    ListView: D8EntryListView,

    actions: function(layout)
    {
      var collection = this.collection;

      return [
        pageActions.jump(this, collection),
        pageActions.export(layout, this, this.collection, false),
        {
          label: t.bound(collection.getNlsDomain(), 'PAGE_ACTION:add'),
          icon: 'plus',
          privileges: 'D8:MANAGE',
          href: collection.genClientUrl('add')
        }
      ];
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}), dictionaries.load());
    },

    destroy: function()
    {
      FilteredListPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    afterRender: function()
    {
      FilteredListPage.prototype.afterRender.call(this);

      dictionaries.load();
    }

  });
});
