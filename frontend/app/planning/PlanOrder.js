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

    isContinuation: function()
    {
      return this.get('date') !== this.collection.plan.id
        && this.get('quantityPlan') > 0
        && this.get('urgent')
        && !this.get('added');
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
