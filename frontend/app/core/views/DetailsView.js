// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  '../View',
  '../util/onModelDeleted'
], function(
  _,
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

    initialize: function()
    {
      View.prototype.initialize.apply(this, arguments);

      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change', this.onModelChanged);
      });
    },

    serialize: function()
    {
      var nlsDomain = this.model.getNlsDomain();

      return _.assign(View.prototype.serialize.apply(this, arguments), {
        panelTitle: t(t.has(nlsDomain, 'PANEL:TITLE:details') ? nlsDomain : 'core', 'PANEL:TITLE:details'),
        model: this.serializeDetails(this.model)
      });
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

    editModel: function(remoteModel)
    {
      this.model.set(remoteModel);
    },

    onModelEdited: function(message)
    {
      var remoteModel = this.model.parse ? this.model.parse(message.model) : message.model;

      if (remoteModel && remoteModel._id === this.model.id)
      {
        this.editModel(remoteModel);
      }
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    },

    onModelChanged: function()
    {
      this.render();
    }

  });
});
