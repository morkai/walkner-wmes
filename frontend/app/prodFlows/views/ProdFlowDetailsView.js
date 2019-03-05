// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  './decorateProdFlow',
  'app/prodFlows/templates/details'
], function(
  DetailsView,
  decorateProdFlow,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render',
      'mrpControllers.synced': 'render'
    },

    getTemplateData: function()
    {
      return _.assign(DetailsView.prototype.getTemplateData.apply(this, arguments), {
        model: decorateProdFlow(this.model)
      });
    }

  });
});
