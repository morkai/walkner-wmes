define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../Order',
  '../views/OrderDetailsView',
  'i18n!app/nls/orders'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  Order,
  OrderDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'orderDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('orders', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      return [
        pageActions.edit(this.model, 'ORDERS:MANAGE'),
        pageActions.delete(this.model, 'ORDERS:MANAGE')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new Order({_id: this.options.orderId}), this);

      this.view = new OrderDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
