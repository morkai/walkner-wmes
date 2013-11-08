define([
  'app/viewport',
  'app/i18n',
  'app/core/View',
  'app/aors/templates/details',
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
      'aors.edited': function(message)
      {
        var updatedAor = message.model;

        if (updatedAor._id === this.model.id)
        {
          this.model.set(updatedAor);
        }
      },
      'aors.deleted': function(message)
      {
        var deletedAor = message.model;

        if (deletedAor._id !== this.model.id)
        {
          return;
        }

        this.broker.subscribe('router.executing').setLimit(1).on('message', function()
        {
          viewport.msg.show({
            type: 'warning',
            time: 5000,
            text: t('aors', 'MSG_ORDER_STATUS_DELETED', {
              name: deletedAor.name
            })
          });
        });

        this.broker.publish('router.navigate', {
          url: '/aors',
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
