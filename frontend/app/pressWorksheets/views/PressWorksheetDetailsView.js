define([
  'app/i18n',
  'app/core/views/DetailsView',
  './decoratePressWorksheet',
  'app/pressWorksheets/templates/details'
], function(
  t,
  DetailsView,
  decoratePressWorksheet,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    serialize: function()
    {
      var data = DetailsView.prototype.serialize.call(this);

      decoratePressWorksheet(data.model);

      return data;
    }

  });
});
