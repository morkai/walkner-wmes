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

    initialize: function()
    {
      this.editing = false;
    },

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
        editing: this.editing,
        model: decorateProdShift(this.model, {
          orgUnits: true,
          personnel: true
        }),
        totalQuantityDone: totalQuantityDone
      };
    },

    afterRender: function()
    {
      DetailsView.prototype.afterRender.call(this);

      if (this.editing)
      {
        this.setUpEditing();
      }
    },

    setUpEditing: function()
    {

    }

  });

});
