// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView'
], function(
  DetailsView
) {
  'use strict';

  return DetailsView.extend({

    remoteTopics: {},

    initialize: function()
    {
      DetailsView.prototype.initialize.apply(this, arguments);

      this.timers.updateDuration = setInterval(this.updateDuration.bind(this), 60000);
    },

    serialize: function()
    {
      const templateData = DetailsView.prototype.serialize.apply(this, arguments);

      templateData.details = templateData.model;
      templateData.model = this.model.attributes;
      templateData.unseen = this.unseen.bind(this, this.model.getObserver());

      return templateData;
    },

    unseen: function(observer, prop, asClassName)
    {
      const changed = observer.changes.all
        || (Array.isArray(prop) ? prop.some(p => !!observer.changes[p]) : !!observer.changes[prop]);
      const unseen = observer.notify && changed;

      if (asClassName)
      {
        return unseen ? 'osh-unseen' : '';
      }

      return unseen;
    },

    updateDuration: function()
    {
      this.$('.prop[data-prop="duration"] .prop-value').text(this.model.getDuration());
    }

  });
});
