define([
  'app/i18n',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/core/views/DetailsView',
  'app/mrpControllers/templates/details',
  'i18n!app/nls/mrpControllers'
], function(
  t,
  divisions,
  subdivisions,
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
      var subdivisionModel = subdivisions.get(data.model.subdivision);

      data.model.subdivision = subdivisionModel ? subdivisionModel.toJSON() : null;

      if (subdivisionModel)
      {
        var divisionModel = divisions.get(subdivisionModel.get('division'));

        data.model.division = divisionModel ? divisionModel.toJSON() : null;
      }

      return data;
    }

  });
});
