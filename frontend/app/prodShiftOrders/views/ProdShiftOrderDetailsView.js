define([
  'app/core/views/DetailsView',
  './decorateProdShiftOrder',
  'app/prodShiftOrders/templates/details'
], function(
  DetailsView,
  decorateProdShiftOrder,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    serialize: function()
    {
      return {
        model: decorateProdShiftOrder(this.model, {
          orgUnits: true,
          orderUrl: true
        })
      };
    }

  });

});
