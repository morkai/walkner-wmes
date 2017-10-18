// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    getActualOrderData: function()
    {
      return this.pick(['quantityTodo', 'quantityDone', 'statuses']);
    },

    getQuantityTodo: function()
    {
      if (this.collection.plan.settings.attributes.useRemainingQuantity)
      {
        return Math.max(0, this.get('quantityTodo') - this.get('quantityDone'));
      }

      return this.get('quantityTodo');
    }

  });
});
