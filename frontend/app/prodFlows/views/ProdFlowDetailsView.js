define([
  'app/i18n',
  'app/data/views/renderOrgUnitPath',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/mrpControllers',
  'app/core/views/DetailsView',
  'app/prodFlows/templates/details',
  'i18n!app/nls/prodFlows'
], function(
  t,
  renderOrgUnitPath,
  divisions,
  subdivisions,
  mrpControllers,
  DetailsView,
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
      var data = DetailsView.prototype.serialize.call(this);

      data.orgUnitPath = renderOrgUnitPath(this.model, true);

      return data;
    }

  });
});
