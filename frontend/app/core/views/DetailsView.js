// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../View',
  '../util/onModelDeleted'
], function(
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

    getTemplateData: function()
    {
      return {
        model: this.serializeDetails(this.model)
      };
    },

    serializeDetails: function(model)
    {
      if (typeof model.serializeDetails === 'function')
      {
        return model.serializeDetails();
      }

      if (typeof model.serialize === 'function')
      {
        return model.serialize();
      }

      return model.toJSON();
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
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
