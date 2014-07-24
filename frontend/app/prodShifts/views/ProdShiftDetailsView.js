// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/DetailsView',
  'app/prodShifts/templates/details'
], function(
  DetailsView,
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
        model: this.model.serialize({
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
