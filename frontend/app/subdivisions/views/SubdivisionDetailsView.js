define([
  'app/i18n',
  'app/data/divisions',
  'app/core/views/DetailsView',
  'app/subdivisions/templates/details',
  'i18n!app/nls/subdivisions'
], function(
  t,
  divisions,
  DetailsView,
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
      var data = DetailsView.prototype.serialize.call(this);
      var division = divisions.get(data.model.division);

      data.model.division = division ? division.toJSON() : null;

      return data;
    }

  });
});
