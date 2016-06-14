// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      return {
        idPrefix: this.idPrefix,
        model: decorateSubdivision(this.model, true)
      };
    }

  });
});
