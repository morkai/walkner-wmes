// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/subdivisions/templates/details'
], function(
  DetailsView,
  renderOrgUnitPath,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'divisions.synced': 'render'
    },

    serializeDetails: function(subdivision)
    {
      return subdivision.serialize({renderOrgUnitPath: renderOrgUnitPath});
    }

  });
});
