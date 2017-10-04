// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PlanSapOrder'
], function(
  Collection,
  PlanSapOrder
) {
  'use strict';

  return Collection.extend({

    model: PlanSapOrder,

    initialize: function(models, options)
    {
      this.plan = options && options.plan;
    },

    url: function()
    {
      return '/planning/sapOrders/' + this.plan.id;
    }

  });
});
