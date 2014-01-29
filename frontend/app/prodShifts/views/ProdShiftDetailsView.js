define([
  'app/core/views/DetailsView',
  './decorateProdShift',
  'app/prodShifts/templates/details'
], function(
  DetailsView,
  decorateProdShift,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    serialize: function()
    {
      var totalQuantityDone = {
        planned: 0,
        actual: 0
      };

      this.model.get('quantitiesDone').forEach(function(quantityDone)
      {
        totalQuantityDone.planned += quantityDone.planned;
        totalQuantityDone.actual += quantityDone.actual;
      });

      return {
        model: decorateProdShift(this.model, {
          orgUnits: true,
          personell: true
        }),
        totalQuantityDone: totalQuantityDone
      };
    }

  });

});
