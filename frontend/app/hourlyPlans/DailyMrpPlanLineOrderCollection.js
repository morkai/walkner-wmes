// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    serializeShifts: function()
    {
      var s = {
        1: [],
        2: [],
        3: []
      };

      for (var i = 0; i < this.length; ++i)
      {
        var lineOrder = this.models[i];
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
          lineOrder: lineOrder
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
