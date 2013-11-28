define([
  'app/i18n',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/DetailsView',
  'app/mrpControllers/templates/details',
  'i18n!app/nls/mrpControllers'
], function(
  t,
  renderOrgUnitPath,
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render'
    },

    serialize: function()
    {
      var data = DetailsView.prototype.serialize.call(this);

      data.orgUnitPath = renderOrgUnitPath(this.model, true);

      return data;
    }

  });
});
