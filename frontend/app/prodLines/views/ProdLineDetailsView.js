// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/views/renderOrgUnitPath',
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

    serialize: function()
    {
      var data = DetailsView.prototype.serialize.call(this);

      data.orgUnitPath = renderOrgUnitPath(this.model, true);

      return data;
    }

  });
});
