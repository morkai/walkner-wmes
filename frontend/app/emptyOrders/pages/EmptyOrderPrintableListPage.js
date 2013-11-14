define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../EmptyOrderCollection',
  '../views/EmptyOrderPrintableListView',
  'i18n!app/nls/emptyOrders'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  EmptyOrderCollection,
  EmptyOrderPrintableListView
) {
  'use strict';

  return View.extend({

    layoutName: 'print',

    pageId: 'emptyOrderPrintableList',

    hdLeft: function() { return t('emptyOrders', 'PRINT_PAGE:HD:LEFT'); },

    breadcrumbs: [
      t.bound('emptyOrders', 'BREADCRUMBS:browse')
    ],

    initialize: function()
    {
      this.collection = bindLoadingMessage(
        new EmptyOrderCollection(null, {rqlQuery: this.options.rql}), this
      );
      this.collection.rqlQuery.limit = -1;

      this.view = new EmptyOrderPrintableListView({collection: this.collection});
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    }

  });
});
