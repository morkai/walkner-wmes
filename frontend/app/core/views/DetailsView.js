define([
  'app/viewport',
  'app/i18n',
  '../View',
  '../util/onModelDeleted'
], function(
  viewport,
  t,
  View,
  onModelDeleted
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
        model: this.serializeDetails(this.model)
      };
    },

    serializeDetails: function(model)
    {
      return model.toJSON();
    },

    beforeRender: function()
    {
      this.stopListening(this.collection, 'change', this.render);
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
      onModelDeleted(this.broker, this.model, message);
    }

  });
});
