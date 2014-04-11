define([
  'underscore',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/fte/templates/masterEntry',
  'app/fte/templates/absentUserRow',
  './fractionsUtil'
], function(
  _,
  View,
  onModelDeleted,
  masterEntryTemplate,
  absentUserRowTemplate,
  fractionsUtil
) {
  'use strict';

  return View.extend({

    template: masterEntryTemplate,

    idPrefix: 'masterEntryDetails',

    remoteTopics: function()
    {
      var topics = {};

      topics['fte.master.updated.' + this.model.id] = 'onModelUpdated';
      topics['fte.master.deleted'] = 'onModelDeleted';

      return topics;
    },

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {
        editable: false,
        renderAbsentUserRow: absentUserRowTemplate,
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

      var $entries = this.$('.fte-masterEntry-absence-entries');
      var $noEntries = this.$('.fte-masterEntry-absence-noEntries');

      if ($entries.children().length)
      {
        $noEntries.hide();
      }
      else
      {
        $entries.hide();
      }
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
