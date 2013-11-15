define([
  'app/viewport',
  'app/i18n',
  '../View'
], function(
  viewport,
  t,
  View
) {
  'use strict';

  return View.extend({

    remoteTopics: function()
    {
      var topics = {};
      var topicPrefix = this.model.getTopicPrefix();

      topics[topicPrefix + '.edited'] = 'onModelEdited';
      topics[topicPrefix + '.deleted'] = 'onModelDeleted';

      return topics;
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
    },

    onModelEdited: function(message)
    {
      var remoteModel = message.model;

      if (remoteModel && remoteModel._id === this.model.id)
      {
        this.model.set(remoteModel);
      }
    },

    onModelDeleted: function(message)
    {
      var remoteModel = message.model;

      if (!remoteModel || remoteModel._id !== this.model.id)
      {
        return;
      }

      var localModel = this.model;

      this.broker.subscribe('router.executing').setLimit(1).on('message', function()
      {
        viewport.msg.show({
          type: 'warning',
          time: 5000,
          text: t(localModel.getNlsDomain() || 'core', 'MSG:DELETED', {
            label: localModel.getLabel()
          })
        });
      });

      this.broker.publish('router.navigate', {
        url: localModel.genClientUrl('base'),
        trigger: true
      });
    }

  });
});
