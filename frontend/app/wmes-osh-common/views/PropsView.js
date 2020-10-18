// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView'
], function(
  DetailsView
) {
  'use strict';

  return DetailsView.extend({

    remoteTopics: {},

    getTemplateData: function()
    {
      return {
        details: this.model.serializeDetails(),
        unseen: this.unseen.bind(this, this.model.getObserver()),
        model: this.model.attributes
      };
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
    }

  });
});
