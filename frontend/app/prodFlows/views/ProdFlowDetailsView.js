define([
  'app/core/views/DetailsView',
  './decorateProdFlow',
  'app/prodFlows/templates/details',
  'i18n!app/nls/prodFlows'
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

    serialize: function()
    {
      return decorateProdFlow(this.model);
    }

  });
});
