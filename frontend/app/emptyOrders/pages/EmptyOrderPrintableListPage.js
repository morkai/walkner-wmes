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
      t.bound('emptyOrders', 'BREADCRUMBS:BROWSE')
    ],

    initialize: function()
    {
      this.model = bindLoadingMessage(
        new EmptyOrderCollection(null, {rqlQuery: this.options.rql}), this
      );
      this.model.rqlQuery.limit = -1;

      this.view = new EmptyOrderPrintableListView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    }

  });
});
