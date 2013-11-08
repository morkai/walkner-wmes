define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../OrderCollection',
  '../views/OrderListView',
  'i18n!app/nls/orders'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  OrderCollection,
  OrderListView
) {
  'use strict';

  return View.extend({

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
      this.model = bindLoadingMessage(
        new OrderCollection(null, {rqlQuery: this.options.rql}), this
      );

      this.view = new OrderListView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    }

  });
});
