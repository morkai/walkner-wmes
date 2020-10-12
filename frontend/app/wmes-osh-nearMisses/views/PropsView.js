// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/wmes-osh-nearMisses/templates/details/props'
], function(
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template,

    getTemplateData: function()
    {
      return {
        details: this.model.serializeDetails(),
        model: this.model.toJSON()
      };
    }

  });
});
