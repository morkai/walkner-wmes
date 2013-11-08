define([
  'app/viewport',
  'app/i18n',
  'app/core/View',
  'app/orderStatuses/templates/details',
  'i18n!app/nls/orders'
], function(
  viewport,
  t,
  View,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    remoteTopics: {
      'orderStatuses.edited': function(message)
      {
        var updatedOrderStatus = message.model;

        if (updatedOrderStatus._id === this.model.id)
        {
          this.model.set(updatedOrderStatus);
        }
      },
      'orderStatuses.deleted': function(message)
      {
        var deletedOrderStatus = message.model;

        if (deletedOrderStatus._id !== this.model.id)
        {
          return;
        }

        this.broker.subscribe('router.executing').setLimit(1).on('message', function()
        {
          viewport.msg.show({
            type: 'warning',
            time: 5000,
            text: t('orderStatuses', 'MSG_ORDER_STATUS_DELETED', {
              _id: deletedOrderStatus._id
            })
          });
        });

        this.broker.publish('router.navigate', {
          url: '/orderStatuses',
          trigger: true
        });
      }
    },

    serialize: function()
    {
      return {
        model: this.model.toJSON()
      };
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);
    }

  });
});
