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

    isLocked: function()
    {
      return !!this.settings.get('locked');
    },

    getStats: function()
    {
      var plan = this.plan;
      var orders = this.orders;
      var mrp = this.id;
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
        orders: {
          todo: 0,
          late: 0,
          plan: 0,
          remaining: 0
        },
        execution: {
          plan: 0,
          done: 0,
          percent: 0,
          1: {
            plan: 0,
            done: 0,
            percent: 0
          },
          2: {
            plan: 0,
            done: 0,
            percent: 0
          },
          3: {
            plan: 0,
            done: 0,
            percent: 0
          }
        }
      };

      if (!plan)
      {
        return stats;
      }

      this.lines.forEach(function(line)
      {
        line.orders.forEach(function(lineOrder)
        {
          var planOrder = plan.orders.get(lineOrder.get('orderNo'));

          if (!planOrder || planOrder.get('mrp') !== mrp)
          {
            return;
          }

          var startAt = Date.parse(lineOrder.get('startAt'));
          var shiftNo = shiftUtil.getShiftNo(startAt);
          var quantityDone = plan.shiftOrders.getTotalQuantityDone(
            line.id, shiftNo, planOrder.id, planOrder.getOperationNo()
          );
          var quantityTodo = lineOrder.get('quantity');

          stats.manHours.plan += lineOrder.get('manHours');
          stats.quantity.plan += quantityTodo;
          stats.orders.plan += 1;
          stats.execution.plan += quantityTodo;
          stats.execution.done += quantityDone;
          stats.execution[shiftNo].plan += quantityTodo;
          stats.execution[shiftNo].done += quantityDone;
        });
      });

      stats.execution.percent = stats.execution.plan
        ? Math.round(stats.execution.done / stats.execution.plan * 100)
        : 100;

      for (var shiftNo = 1; shiftNo <= 3; ++shiftNo)
      {
        stats.execution[shiftNo].percent = stats.execution[shiftNo].plan
          ? Math.round(stats.execution[shiftNo].done / stats.execution[shiftNo].plan * 100)
          : 100;
      }

      orders.forEach(function(planOrder)
      {
        var sapOrder = plan.sapOrders.get(planOrder.id);

        if (!sapOrder || planOrder.get('mrp') !== mrp)
        {
          return;
        }

        var quantityRemaining = sapOrder.get('quantityTodo') - sapOrder.getQuantityDone();

        stats.manHours.todo += planOrder.get('manHours');
        stats.quantity.todo += planOrder.getQuantityTodo();
        stats.orders.todo += 1;
        stats.manHours.remaining += planOrder.getManHours(quantityRemaining);
        stats.quantity.remaining += quantityRemaining;
        stats.orders.remaining += quantityRemaining > 0 ? 1 : 0;
      });

      plan.lateOrders.mrp(this.id).forEach(function(lateOrder)
      {
        if (!orders.get(lateOrder.id))
        {
          stats.manHours.late += lateOrder.get('manHours');
          stats.quantity.late += lateOrder.getQuantityTodo();
          stats.orders.late += 1;
        }
      });

      return stats;
    }

  });
});
