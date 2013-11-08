define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../OrderStatus',
  '../views/OrderStatusDetailsView',
  'i18n!app/nls/orderStatuses'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  OrderStatus,
  OrderStatusDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'orderStatusDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('orderStatuses', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      return [
        pageActions.edit(this.model, 'ORDER_STATUSES:MANAGE'),
        pageActions.delete(this.model, 'ORDER_STATUSES:MANAGE')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new OrderStatus({_id: this.options.orderStatusId}), this);

      this.view = new OrderStatusDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
