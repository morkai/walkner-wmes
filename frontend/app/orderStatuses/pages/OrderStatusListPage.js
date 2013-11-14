define([
  'app/viewport',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../views/OrderStatusListView',
  'i18n!app/nls/orderStatuses'
], function(
  viewport,
  t,
  bindLoadingMessage,
  pageActions,
  View,
  OrderStatusListView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'orderStatusList',

    breadcrumbs: [
      t.bound('orderStatuses', 'BREADCRUMBS:BROWSE')
    ],

    actions: function()
    {
      return [pageActions.add(this.model, 'DICTIONARIES:MANAGE')];
    },

    initialize: function()
    {
      this.model = this.options.orderStatuses;

      this.view = new OrderStatusListView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    }

  });
});
