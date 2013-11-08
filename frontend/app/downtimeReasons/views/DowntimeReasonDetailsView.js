define([
  'app/viewport',
  'app/i18n',
  'app/core/View',
  'app/downtimeReasons/templates/details',
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
      'downtimeReasons.edited': function(message)
      {
        var updatedDowntimeReason = message.model;

        if (updatedDowntimeReason._id === this.model.id)
        {
          this.model.set(updatedDowntimeReason);
        }
      },
      'downtimeReasons.deleted': function(message)
      {
        var deletedDowntimeReason = message.model;

        if (deletedDowntimeReason._id !== this.model.id)
        {
          return;
        }

        this.broker.subscribe('router.executing').setLimit(1).on('message', function()
        {
          viewport.msg.show({
            type: 'warning',
            time: 5000,
            text: t('downtimeReasons', 'MSG_ORDER_STATUS_DELETED', {
              _id: deletedDowntimeReason._id
            })
          });
        });

        this.broker.publish('router.navigate', {
          url: '/downtimeReasons',
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
