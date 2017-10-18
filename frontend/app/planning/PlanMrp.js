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
          return this.collection.plan;
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
      var stats = {
        manHours: {
          todo: 0,
          done: 0,
          late: 0
        },
        quantity: {
          todo: 0,
          done: 0,
          late: 0
        }
      };

      orders.forEach(function(order)
      {
        stats.manHours.todo += order.get('manHours');
        stats.quantity.todo += order.getQuantityTodo();
      });

      this.lines.forEach(function(line)
      {
        (line.get('shiftData') || []).forEach(function(shift)
        {
          stats.manHours.done += shift.manHours;
          stats.quantity.done += shift.quantity;
        });
      });

      this.plan.lateOrders.mrp(this.id).forEach(function(lateOrder)
      {
        if (!orders.get(lateOrder.id))
        {
          stats.manHours.late += lateOrder.get('manHours');
          stats.quantity.late += lateOrder.getQuantityTodo();
        }
      });

      stats.manHours.todo = Math.round(stats.manHours.todo * 1000) / 1000;
      stats.manHours.done = Math.round(stats.manHours.done * 1000) / 1000;
      stats.manHours.late = Math.round(stats.manHours.late * 1000) / 1000;

      return stats;
    }

  });
});
