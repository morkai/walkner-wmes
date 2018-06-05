// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  '../data/orgUnits',
  './PlanOrderCollection',
  './PlanLineCollection',
  './util/shift'
], function(
  Model,
  orgUnits,
  PlanOrderCollection,
  PlanLineCollection,
  shiftUtil
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
        },
        execution: {
          plan: 0,
          done: 0,
          percent: 0
        }
      };

      this.lines.forEach(function(line)
      {
        (line.get('shiftData') || []).forEach(function(shift)
        {
          stats.manHours.plan += shift.manHours;
          stats.quantity.plan += shift.quantity;
        });

        line.orders.forEach(function(lineOrder)
        {
          var startAt = Date.parse(lineOrder.get('startAt'));
          var shiftNo = shiftUtil.getShiftNo(startAt);
          var quantityDone = plan.shiftOrders.getTotalQuantityDone(line.id, shiftNo, lineOrder.get('orderNo'));
          var quantityTodo = lineOrder.get('quantity');

          stats.execution.plan += 1;
          stats.execution.done += quantityDone >= quantityTodo ? 1 : 0;
        });
      });

      stats.execution.percent = stats.execution.plan
        ? Math.round(stats.execution.done / stats.execution.plan * 100)
        : 100;

      if (plan)
      {
        orders.forEach(function(planOrder)
        {
          var sapOrder = plan.sapOrders.get(planOrder.id);

          if (!sapOrder)
          {
            return;
          }

          var quantityRemaining = sapOrder.get('quantityTodo') - sapOrder.getQuantityDone();

          stats.manHours.todo += planOrder.get('manHours');
          stats.quantity.todo += planOrder.getQuantityTodo();
          stats.manHours.remaining += planOrder.getManHours(quantityRemaining);
          stats.quantity.remaining += quantityRemaining;
        });

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
