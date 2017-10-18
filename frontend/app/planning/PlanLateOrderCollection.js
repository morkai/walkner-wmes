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

      this.byMrp = null;

      this.on('reset', function() { this.byMrp = null; }, this);
    },

    url: function()
    {
      return '/planning/lateOrders/' + this.plan.id;
    },

    mrp: function(mrpId)
    {
      if (this.byMrp === null)
      {
        var byMrp = this.byMrp = {};

        this.forEach(function(lateOrder)
        {
          var mrp = lateOrder.get('mrp');

          if (!byMrp[mrp])
          {
            byMrp[mrp] = [lateOrder];
          }
          else
          {
            byMrp[mrp].push(lateOrder);
          }
        });
      }

      return this.byMrp[mrpId] || [];
    }

  });
});
