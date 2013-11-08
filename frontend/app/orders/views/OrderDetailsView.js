define([
  'app/viewport',
  'app/i18n',
  'app/core/View',
  'app/data/orderStatuses',
  'app/orders/templates/details',
  'app/orderStatuses/templates/_orderStatus',
  'i18n!app/nls/orders'
], function(
  viewport,
  t,
  View,
  orderStatuses,
  detailsTemplate,
  renderOrderStatus
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    remoteTopics: {
      'orders.edited': function(message)
      {
        var updatedOrder = message.model;

        if (updatedOrder._id === this.model.id)
        {
          this.model.set(updatedOrder);
        }
      },
      'orders.deleted': function(message)
      {
        var deletedOrder = message.model;

        if (deletedOrder._id !== this.model.id)
        {
          return;
        }

        this.broker.subscribe('router.executing').setLimit(1).on('message', function()
        {
          viewport.msg.show({
            type: 'warning',
            time: 5000,
            text: t('orders', 'MSG_ORDER_DELETED', {
              _id: deletedOrder._id
            })
          });
        });

        this.broker.publish('router.navigate', {
          url: '/orders',
          trigger: true
        });
      }
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
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);
    }

  });
});
