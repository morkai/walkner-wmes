// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/prodShiftOrders/templates/details'
], function(
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    remoteTopics: {},

    serialize: function()
    {
      return {
        model: this.model.serialize({
          orgUnits: true,
          orderUrl: true
        })
      };
    }

  });

});
