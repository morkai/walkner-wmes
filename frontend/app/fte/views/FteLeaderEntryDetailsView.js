define([
  'underscore',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/fte/templates/leaderEntry',
  './fractionsUtil'
], function(
  _,
  View,
  onModelDeleted,
  leaderEntryTemplate,
  fractionsUtil
) {
  'use strict';

  return View.extend({

    template: leaderEntryTemplate,

    idPrefix: 'leaderEntryDetails',

    remoteTopics: function()
    {
      var topics = {};

      topics['fte.leader.updated.' + this.model.id] = 'onModelUpdated';
      topics['fte.leader.deleted'] = 'onModelDeleted';

      return topics;
    },

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {
        editable: false,
        round: fractionsUtil.round
      });
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);
    },

    onModelUpdated: function(message)
    {
      this.model.handleUpdateMessage(message);
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    }

  });
});
