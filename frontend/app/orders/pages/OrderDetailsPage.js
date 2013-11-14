define([
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  '../Order',
  '../views/OrderDetailsView',
  'i18n!app/nls/orders'
], function(
  bindLoadingMessage,
  DetailsPage,
  Order,
  OrderDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    pageId: 'orderDetails',

    actions: [],

    initialize: function()
    {
      this.model = bindLoadingMessage(new Order({_id: this.options.modelId}), this);

      this.view = new OrderDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
