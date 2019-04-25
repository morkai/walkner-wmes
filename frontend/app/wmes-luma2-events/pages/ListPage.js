// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/FilterView',
  '../views/ListView'
], function(
  FilteredListPage,
  pageActions,
  dictionaries,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,

    FilterView: FilterView,
    ListView: ListView,

    actions: function(layout)
    {
      var collection = this.collection;

      return [
        pageActions.export(layout, this, collection, false),
        {
          icon: 'genderless',
          label: this.t('PAGE_ACTION:lines'),
          privileges: 'LUMA2:MANAGE',
          href: '#luma2/lines'
        },
        {
          icon: 'cogs',
          label: this.t('PAGE_ACTION:settings'),
          privileges: 'LUMA2:MANAGE',
          href: '#luma2/settings'
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
