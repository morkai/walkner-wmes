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
      this.mrp = options && options.mrp;
    },

    url: function()
    {
      var url = '/planning/sapOrders/' + this.plan.id;

      if (this.mrp)
      {
        url += '?mrp=' + this.mrp;
      }

      return url;
    }

  });
});
