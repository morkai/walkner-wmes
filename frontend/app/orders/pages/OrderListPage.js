// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/delayReasons/storage',
  '../OrderCollection',
  '../views/OrderListView',
  '../views/OrderFilterView',
  '../views/OpenOrdersPrintView',
  'app/core/templates/listPage'
], function(
  t,
  viewport,
  pageActions,
  bindLoadingMessage,
  View,
  delayReasonsStorage,
  OrderCollection,
  OrderListView,
  OrderFilterView,
  OpenOrdersPrintView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'orderList',

    breadcrumbs: [
      t.bound('orders', 'BREADCRUMBS:browse')
    ],

    actions: function(layout)
    {
      var page = this;

      return [
        pageActions.jump(page, page.collection, {mode: 'id'}),
        pageActions.export(layout, page, page.collection),
        {
          label: page.t('PAGE_ACTION:openOrdersPrint'),
          icon: 'print',
          callback: function()
          {
            viewport.showDialog(new OpenOrdersPrintView(), page.t('openOrdersPrint:title'));
          }
        },
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'ORDERS:MANAGE',
          href: '#orders;settings'
        }
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    destroy: function()
    {
      delayReasonsStorage.release();
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(
        new OrderCollection(null, {rqlQuery: this.options.rql}), this
      );

      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);
    },

    defineViews: function()
    {
      this.filterView = new OrderFilterView({
        model: {
          nlsDomain: this.collection.getNlsDomain(),
          rqlQuery: this.collection.rqlQuery
        }
      });

      this.listView = new OrderListView({
        collection: this.collection,
        delayReasons: this.delayReasons
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(
        this.collection.fetch({reset: true}),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      delayReasonsStorage.acquire();
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
