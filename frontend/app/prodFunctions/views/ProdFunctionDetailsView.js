define([
  'app/core/views/DetailsView',
  './decorateProdFunction',
  'app/prodFunctions/templates/details'
], function(
  DetailsView,
  decorateProdFunction,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'companies.synced': 'render'
    },

    serialize: function()
    {
      return {model: decorateProdFunction(this.model)};
    }

  });
});
