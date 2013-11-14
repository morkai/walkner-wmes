define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../OrderCollection',
  '../views/OrderListView',
  '../views/OrderFilterView',
  'app/orders/templates/listPage',
  'i18n!app/nls/orders'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  OrderCollection,
  OrderListView,
  OrderFilterView,
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

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.orders-list-container', this.listView);
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(
        new OrderCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new OrderFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        }
      });

      this.listView = new OrderListView({collection: this.collection});

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.collection.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
