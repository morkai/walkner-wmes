// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/wmes-osh-nearMisses/templates/details/props'
], function(
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template,

    remoteTopics: {},

    getTemplateData: function()
    {
      return {
        details: this.model.serializeDetails(),
        unseen: this.unseen.bind(this, this.model.getObserver()),
        model: this.model.toJSON()
      };
    },

    unseen: function(observer, prop, asClassName)
    {
      const unseen = observer.notify && (observer.changes.all || !!observer.changes[prop]);

      if (asClassName)
      {
        return unseen ? 'osh-unseen' : '';
      }

      return unseen;
    }

  });
});
