define([
  'app/data/views/renderOrgUnitPath',
  'app/core/views/DetailsView',
  'app/workCenters/templates/details',
  'i18n!app/nls/workCenters'
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

    serialize: function()
    {
      var data = DetailsView.prototype.serialize.call(this);

      data.orgUnitPath = renderOrgUnitPath(this.model, true);

      return data;
    }

  });
});
