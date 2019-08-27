// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  'app/kaizenOrders/dictionaries',
  '../views/MinutesForSafetyCardFilterView',
  '../views/MinutesForSafetyCardListView'
], function(
  t,
  user,
  FilteredListPage,
  pageActions,
  kaizenDictionaries,
  MinutesForSafetyCardFilterView,
  MinutesForSafetyCardListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,
    FilterView: MinutesForSafetyCardFilterView,
    ListView: MinutesForSafetyCardListView,

    actions: function()
    {
      var collection = this.collection;

      return [
        pageActions.jump(this, collection),
        {
          label: this.t('core', 'PAGE_ACTION:add'),
          icon: 'plus',
          href: collection.genClientUrl('add'),
          privileges: function() { return user.isAllowedTo('KAIZEN:MANAGE', 'FN:leader'); }
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
