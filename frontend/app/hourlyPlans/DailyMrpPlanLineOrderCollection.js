// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './util/shift',
  './DailyMrpPlanLineOrder'
], function(
  Collection,
  shiftUtil,
  DailyMrpPlanLineOrder
) {
  'use strict';

  return Collection.extend({

    model: DailyMrpPlanLineOrder,

    initialize: function(attrs, options)
    {
      this.line = options.line;
    },

    serializeShifts: function()
    {
      var thisLine = this.line;
      var thisPlan = this.line.collection.plan;
      var allPlans = thisPlan.collection;
      var allLineOrders = this.map(function(lineOrder)
      {
        return {
          plan: thisPlan.id,
          mrp: thisPlan.mrp.id,
          lineOrder: lineOrder
        };
      });

      allPlans.forEach(function(otherPlan)
      {
        if (otherPlan === thisPlan)
        {
          return;
        }

        var otherLine = otherPlan.lines.get(thisLine.id);

        if (!otherLine)
        {
          return;
        }

        otherLine.orders.forEach(function(lineOrder)
        {
          allLineOrders.push({
            plan: otherPlan.id,
            mrp: otherPlan.mrp.id,
            lineOrder: lineOrder
          });
        });
      });

      if (allLineOrders > this.length)
      {
        allLineOrders.sort(function(a, b)
        {
          return a.lineOrder.startMoment.valueOf() - b.lineOrder.startMoment.valueOf();
        });
      }

      var s = {
        1: [],
        2: [],
        3: []
      };

      for (var i = 0; i < allLineOrders.length; ++i)
      {
        var item = allLineOrders[i];
        var plan = item.plan;
        var lineOrder = item.lineOrder;
        var shiftOrders = s[lineOrder.shiftNo];
        var prevShiftOrder = shiftOrders[shiftOrders.length - 1];
        var prevFinishedAt = prevShiftOrder
          ? prevShiftOrder.lineOrder.finishMoment.valueOf()
          : shiftUtil.getShiftStartTime(lineOrder.startMoment.valueOf());

        shiftOrders.push({
          _id: lineOrder.id,
          orderNo: lineOrder.get('orderNo'),
          qty: lineOrder.get('qty'),
          margin: (lineOrder.startMoment.valueOf() - prevFinishedAt) * 100 / shiftUtil.SHIFT_DURATION,
          width: lineOrder.duration * 100 / shiftUtil.SHIFT_DURATION,
          incomplete: lineOrder.get('incomplete'),
          lineOrder: lineOrder,
          plan: plan,
          mrp: item.mrp,
          external: plan !== thisPlan.id
        });
      }

      var shifts = [];

      if (s[1].length)
      {
        shifts.push({no: 1, orders: s[1]});
      }

      if (s[2].length)
      {
        shifts.push({no: 2, orders: s[2]});
      }

      if (s[3].length)
      {
        shifts.push({no: 3, orders: s[3]});
      }

      return shifts;
    }

  });
});
