// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  '../data/orgUnits',
  './PlanOrderCollection',
  './PlanLineCollection'
], function(
  Model,
  orgUnits,
  PlanOrderCollection,
  PlanLineCollection
) {
  'use strict';

  return Model.extend({

    initialize: function()
    {
      var mrpController = orgUnits.getByTypeAndId('mrpController', this.id);

      this.attributes.description = mrpController ? mrpController.get('description') : '';

      this.orders = new PlanOrderCollection(null, {paginate: false});

      this.lines = new PlanLineCollection(null, {paginate: false});

      if (this.attributes.orders)
      {
        this.orders.reset(this.attributes.orders);

        delete this.attributes.orders;
      }

      if (this.attributes.lines)
      {
        this.lines.reset(this.attributes.lines);

        delete this.attributes.lines;
      }

      Object.defineProperty(this, 'plan', {
        get: function()
        {
          return this.collection ? this.collection.plan : null;
        }
      });

      Object.defineProperty(this, 'settings', {
        get: function()
        {
          return this.plan.settings.mrps.get(this.id);
        }
      });
    },

    getStats: function()
    {
      var orders = this.orders;
      var plan = this.plan;
      var stats = {
        manHours: {
          todo: 0,
          late: 0,
          plan: 0,
          remaining: 0
        },
        quantity: {
          todo: 0,
          late: 0,
          plan: 0,
          remaining: 0
        }
      };

      orders.forEach(function(order)
      {
        var sapOrder = plan.sapOrders.get(order.id);
        var quantityRemaining = sapOrder.get('quantityTodo') - sapOrder.get('quantityDone');

        stats.manHours.todo += order.get('manHours');
        stats.quantity.todo += order.getQuantityTodo();
        stats.manHours.remaining += order.getManHours(quantityRemaining);
        stats.quantity.remaining += quantityRemaining;
      });

      this.lines.forEach(function(line)
      {
        (line.get('shiftData') || []).forEach(function(shift)
        {
          stats.manHours.plan += shift.manHours;
          stats.quantity.plan += shift.quantity;
        });
      });

      if (plan)
      {
        plan.lateOrders.mrp(this.id).forEach(function(lateOrder)
        {
          if (!orders.get(lateOrder.id))
          {
            stats.manHours.late += lateOrder.get('manHours');
            stats.quantity.late += lateOrder.getQuantityTodo();
          }
        });
      }

      return stats;
    }

  });
});
