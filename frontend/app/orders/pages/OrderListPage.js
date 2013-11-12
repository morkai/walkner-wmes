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
      t.bound('orders', 'BREADCRUMBS:BROWSE')
    ],

    actions: function()
    {
      return [pageActions.add(this.model, 'ORDERS:MANAGE')];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.orders-list-container', this.listView);
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(
        new OrderCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new OrderFilterView({
        model: {
          rqlQuery: this.model.rqlQuery
        }
      });

      this.listView = new OrderListView({model: this.model});

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.model.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
