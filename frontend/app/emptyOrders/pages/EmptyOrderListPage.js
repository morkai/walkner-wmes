define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../EmptyOrderCollection',
  '../views/EmptyOrderListView',
  'i18n!app/nls/emptyOrders'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  EmptyOrderCollection,
  EmptyOrderListView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'emptyOrderList',

    breadcrumbs: [
      t.bound('emptyOrders', 'BREADCRUMBS:browse')
    ],

    actions: [
      {
        label: t.bound('emptyOrders', 'PAGE_ACTION:print'),
        icon: 'print',
        href: '#emptyOrders;print',
        privileges: 'ORDERS:VIEW'
      }
    ],

    initialize: function()
    {
      this.collection = bindLoadingMessage(
        new EmptyOrderCollection(null, {rqlQuery: this.options.rql}), this
      );

      this.view = new EmptyOrderListView({collection: this.collection});
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    }

  });
});
