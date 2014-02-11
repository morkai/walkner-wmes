define([
  'app/core/views/DetailsView',
  './decorateSubdivision',
  'app/subdivisions/templates/details'
], function(
  DetailsView,
  decorateSubdivision,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'divisions.synced': 'render'
    },

    serialize: function()
    {
      return {model: decorateSubdivision(this.model)};
    }

  });
});
