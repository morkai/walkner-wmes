// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../settings',
  '../ProdDowntimeCollection',
  '../views/ProdDowntimeListView',
  '../views/ProdDowntimeFilterView',
  'app/core/templates/listPage'
], function(
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  settings,
  ProdDowntimeCollection,
  ProdDowntimeListView,
  ProdDowntimeFilterView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    pageId: 'prodDowntimeList',

    breadcrumbs: function()
    {
      return [this.t('BREADCRUMB:browse')];
    },

    actions: function(layout)
    {
      return [
        pageActions.jump(this, this.collection),
        pageActions.export(layout, this, this.collection),
        {
          label: this.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'PROD_DATA:MANAGE',
          href: '#prodDowntimes;settings'
        },
        {
          label: this.t('PAGE_ACTION:alerts'),
          icon: 'bell',
          privileges: 'PROD_DOWNTIME_ALERTS:VIEW',
          href: '#prodDowntimeAlerts'
        }
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('#-filter', this.filterView);
      this.setView('#-list', this.listView);
    },

    destroy: function()
    {
      settings.release();
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(this.collection, this);
      this.settings = bindLoadingMessage(settings.acquire(), this);
    },

    defineViews: function()
    {
      this.listView = new ProdDowntimeListView({
        collection: this.collection,
        settings: this.settings,
        orderColumn: true
      });

      this.filterView = new ProdDowntimeFilterView({
        model: this.collection
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      if (this.settings.isEmpty())
      {
        return when(this.collection.fetch({reset: true}), this.settings.fetch({reset: true}));
      }

      return when(this.collection.fetch({reset: true}));
    },

    afterRender: function()
    {
      settings.acquire();
    },

    refreshList: function(newRqlQuery)
    {
      this.collection.rqlQuery = newRqlQuery;

      this.listView.refreshCollectionNow();

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
