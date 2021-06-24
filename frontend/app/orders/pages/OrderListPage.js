// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/FilteredListPage',
  'app/delayReasons/storage',
  '../OrderCollection',
  '../views/OrderListView',
  '../views/OrderFilterView',
  '../views/OpenOrdersPrintView'
], function(
  viewport,
  pageActions,
  bindLoadingMessage,
  FilteredListPage,
  delayReasonsStorage,
  OrderCollection,
  OrderListView,
  OrderFilterView,
  OpenOrdersPrintView
) {
  'use strict';

  return FilteredListPage.extend({

    actions: function(layout)
    {
      var page = this;

      return [
        pageActions.jump(page, page.collection, {mode: 'id'}),
        pageActions.export(layout, page, page.collection),
        {
          label: page.t('PAGE_ACTION:openOrdersPrint'),
          icon: 'print',
          privileges: 'USER',
          callback: function()
          {
            viewport.showDialog(new OpenOrdersPrintView(), page.t('openOrdersPrint:title'));
          }
        },
        {
          label: page.t('PAGE_ACTION:tags'),
          icon: 'tag',
          privileges: 'ORDERS:MANAGE',
          href: '#productTags'
        },
        {
          label: page.t('PAGE_ACTION:notes'),
          icon: 'sticky-note-o',
          privileges: 'ORDERS:MANAGE',
          href: '#productNotes'
        },
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'ORDERS:MANAGE',
          href: '#orders;settings'
        }
      ];
    },

    destroy: function()
    {
      delayReasonsStorage.release();
    },

    defineModels: function()
    {
      FilteredListPage.prototype.defineModels.apply(this, arguments);

      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);
    },

    createFilterView: function()
    {
      return new OrderFilterView({
        model: this.collection,
        delayReasons: this.delayReasons
      });
    },

    createListView: function()
    {
      return new OrderListView({
        collection: this.collection,
        delayReasons: this.delayReasons
      });
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
    }
  });
});
