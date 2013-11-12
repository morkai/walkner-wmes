define([
  'app/viewport',
  'app/i18n',
  'app/core/View',
  'app/workCenters/templates/details',
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
      'workCenters.edited': function(message)
      {
        var updatedWorkCenter = message.model;

        if (updatedWorkCenter._id === this.model.id)
        {
          this.model.set(updatedWorkCenter);
        }
      },
      'workCenters.deleted': function(message)
      {
        var deletedWorkCenter = message.model;

        if (deletedWorkCenter._id !== this.model.id)
        {
          return;
        }

        this.broker.subscribe('router.executing').setLimit(1).on('message', function()
        {
          viewport.msg.show({
            type: 'warning',
            time: 5000,
            text: t('workCenters', 'MSG_ORDER_STATUS_DELETED', {
              name: deletedWorkCenter.name
            })
          });
        });

        this.broker.publish('router.navigate', {
          url: '/workCenters',
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
