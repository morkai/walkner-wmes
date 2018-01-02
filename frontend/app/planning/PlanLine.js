// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  './PlanLineOrderCollection'
], function(
  Model,
  PlanLineOrderCollection
) {
  'use strict';

  return Model.extend({

    defaults: function()
    {
      return {
        version: 0,
        orders: [],
        downtimes: [],
        totalQuantity: 0,
        hourlyPlan: [],
        pceTimes: []
      };
    },

    initialize: function()
    {
      this.orders = new PlanLineOrderCollection(null, {
        plan: this.collection.plan,
        paginate: false
      });

      if (this.attributes.orders)
      {
        this.orders.reset(this.attributes.orders);

        delete this.attributes.orders;
      }

      Object.defineProperty(this, 'plan', {
        get: function()
        {
          return this.collection.plan;
        }
      });

      Object.defineProperty(this, 'settings', {
        get: function()
        {
          return this.plan.settings.lines.get(this.id);
        }
      });
    },

    mrpSettings: function(mrpId)
    {
      var mrpSettings = this.plan.settings.mrps.get(mrpId);

      return mrpSettings ? mrpSettings.lines.get(this.id) : null;
    },

    getFrozenOrderCount: function()
    {
      return Array.isArray(this.attributes.frozenOrders) ? this.attributes.frozenOrders.length : 0;
    }

  });
});
