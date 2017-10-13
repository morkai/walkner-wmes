// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PlanLateOrder'
], function(
  Collection,
  PlanLateOrder
) {
  'use strict';

  return Collection.extend({

    model: PlanLateOrder,

    initialize: function(models, options)
    {
      this.plan = options && options.plan;
    },

    url: function()
    {
      return '/planning/lateOrders/' + this.plan.id;
    }

  });
});
