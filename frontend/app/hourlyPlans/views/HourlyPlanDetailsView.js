define([
  'underscore',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/hourlyPlans/templates/entry'
], function(
  _,
  View,
  onModelDeleted,
  entryTemplate
) {
  'use strict';

  return View.extend({

    template: entryTemplate,

    idPrefix: 'hourlyPlanDetails',

    remoteTopics: function()
    {
      var topics = {};

      topics['hourlyPlans.updated.' + this.model.id] =
        this.model.handleUpdateMessage.bind(this.model);
      topics['hourlyPlans.deleted'] = this.onModelDeleted.bind(this);

      return topics;
    },

    initialize: function()
    {
      this.lastRefreshAt = 0;
    },

    serialize: function()
    {
      return _.extend(this.model.serialize(), {
        editable: false
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

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    }

  });
});
