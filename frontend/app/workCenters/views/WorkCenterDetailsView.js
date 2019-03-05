// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/views/DetailsView',
  'app/workCenters/templates/details'
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

    getTemplateData: function()
    {
      var data = DetailsView.prototype.getTemplateData.call(this);

      data.orgUnitPath = renderOrgUnitPath(this.model, true);

      return data;
    }

  });
});
