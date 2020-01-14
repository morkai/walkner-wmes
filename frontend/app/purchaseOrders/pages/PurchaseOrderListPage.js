// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../PurchaseOrderCollection',
  '../views/PurchaseOrderListView',
  '../views/PurchaseOrderFilterView',
  'app/core/templates/listPage'
], function(
  t,
  bindLoadingMessage,
  View,
  PurchaseOrderCollection,
  PurchaseOrderListView,
  PurchaseOrderFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    breadcrumbs: [
      t.bound('purchaseOrders', 'BREADCRUMB:browse')
    ],

    actions: [],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(
        new PurchaseOrderCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new PurchaseOrderFilterView({
        model: this.collection
      });

      this.listView = new PurchaseOrderListView({collection: this.collection});

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
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
