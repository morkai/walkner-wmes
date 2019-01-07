// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/notifications',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/FilterView',
  '../views/ListView'
], function(
  t,
  notifications,
  FilteredListPage,
  pageActions,
  dictionaries,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    actions: function(layout)
    {
      var collection = this.collection;

      return [
        pageActions.jump(this, collection),
        pageActions.export(layout, this, this.collection, false),
        {
          label: this.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'FAP:MANAGE',
          href: '#fap/settings'
        }
      ];
    },

    load: function(when)
    {
      return when(dictionaries.load(), this.collection.fetch({reset: true}));
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

      notifications.renderRequest(this);
    }

  });
});
