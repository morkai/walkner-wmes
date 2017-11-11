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

    isAutoAdded: function()
    {
      return this.attributes.source === 'incomplete' || this.attributes.source === 'late';
    },

    getQuantityTodo: function()
    {
      var quantityPlan = this.get('quantityPlan');

      if (quantityPlan > 0)
      {
        return quantityPlan;
      }

      if (this.collection.plan.settings.attributes.useRemainingQuantity)
      {
        return Math.max(0, this.get('quantityTodo') - this.get('quantityDone'));
      }

      return this.get('quantityTodo');
    }

  });
});
