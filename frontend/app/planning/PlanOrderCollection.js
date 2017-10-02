// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PlanOrder'
], function(
  Collection,
  PlanOrder
) {
  'use strict';

  return Collection.extend({

    model: PlanOrder,

    initialize: function(models, options)
    {
      this.plan = options && options.plan;
    },

    getGroupedByMrp: function()
    {
      var mrpToOrders = {};

      this.forEach(function(order)
      {
        var mrpId = order.get('mrp');

        if (!mrpToOrders[mrpId])
        {
          mrpToOrders[mrpId] = [];
        }

        mrpToOrders[mrpId].push(order);
      });

      return mrpToOrders;
    }

  });
});
