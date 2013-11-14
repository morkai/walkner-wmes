define([
  'app/core/views/DetailsView',
  'app/data/orderStatuses',
  'app/orders/templates/details',
  'app/orderStatuses/templates/_orderStatus',
  'i18n!app/nls/orders'
], function(
  DetailsView,
  orderStatuses,
  detailsTemplate,
  renderOrderStatus
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    serialize: function()
    {
      var order = this.model.toJSON();

      order.statusLabels = orderStatuses
        .findAndFill(order.statuses)
        .map(function(orderStatus) { return renderOrderStatus(orderStatus); })
        .join('');

      return {
        model: order
      };
    }

  });
});
