// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/views/DetailsView',
  'app/prodLines/templates/details'
], function(
  renderOrgUnitPath,
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render',
      'mrpControllers.synced': 'render',
      'prodFlows.synced': 'render'
    },

    serializeDetails: function()
    {
      var data = this.model.toJSON();

      data.orgUnitPath = renderOrgUnitPath(this.model, true);

      return data;
    }

  });
});
