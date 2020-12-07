// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/View',
  'app/planning/util/shift',
  'app/planning/templates/planExecution'
], function(
  _,
  time,
  View,
  shiftUtil,
  template
) {
  'use strict';

  var CMP_CLASS = {
    true: 'is-ok',
    false: 'is-nok'
  };

  return View.extend({

    template: template,

    getTemplateData: function()
    {
      var selectedMrp = this.mrp ? this.mrp.id : null;

      return {
        mrps: this.plan.mrps
          .map(mrp =>
          {
            if (selectedMrp && mrp.id !== selectedMrp)
            {
              return null;
            }

            return {
              _id: mrp.id,
              lines: mrp.lines
                .map(line =>
                {
                  return {
                    _id: line.id,
                    orders: line.orders
                      .map(lineOrder => this.serializeLineOrder(lineOrder, line))
                      .filter(order => !!order)
                  };
                })
                .filter(line => !!line && line.orders.length)
            };
          })
          .filter(mrp => !!mrp)
      };
    },

    serializeLineOrder: function(lineOrder, line)
    {
      var orderNo = lineOrder.get('orderNo');
      var planOrder = this.plan.orders.get(orderNo);

      if (!planOrder)
      {
        return null;
      }

      var timeWindow = 4 * 3600 * 1000;
      var operationNo = planOrder.getOperationNo();
      var quantityPlanned = lineOrder.get('quantity');
      var startAt = time.utc.getMoment(lineOrder.get('startAt'));
      var startAtTime = startAt.valueOf();
      var startAtDate = startAt.format('YYYY-MM-DD');
      var shiftStartTime = shiftUtil.getShiftStartTime(startAtTime, false);
      var shiftEndTime = shiftStartTime + shiftUtil.SHIFT_DURATION;
      var fromTime = startAtTime - timeWindow;
      var toTime = startAtTime + timeWindow;
      var prevShiftOverlap = fromTime - shiftStartTime;
      var nextShiftOverlap = toTime - shiftEndTime;

      if (prevShiftOverlap < 0 || nextShiftOverlap > 0)
      {
        var workingTimes = this.plan.workingLines.getWorkingTimes(line);
        var shiftNo = shiftUtil.getShiftNo(startAtTime, false);

        if (prevShiftOverlap < 0 && workingTimes.prevAt[shiftNo])
        {
          fromTime = time.utc.getMoment(workingTimes.prevAt[shiftNo]).local(true).valueOf()
            + prevShiftOverlap;
        }

        if (nextShiftOverlap > 0 && workingTimes.nextAt[shiftNo])
        {
          toTime = time.utc.getMoment(workingTimes.nextAt[shiftNo]).local(true).valueOf()
            + nextShiftOverlap;
        }
      }

      var shiftOrders = [];
      var ok = false;

      this.plan.shiftOrders.sumExecutionOrders(this.plan.shiftOrders.findOrders(orderNo)).forEach(shiftOrder =>
      {
        var opNo = shiftOrder.operationNo;

        if (operationNo !== opNo)
        {
          return;
        }

        var prodLine = shiftOrder.prodLine;
        var quantityDone = shiftOrder.quantityDone;
        var startedAt = time.getMoment(shiftOrder.startedAt).utc(true);
        var startedAtTime = startedAt.valueOf();
        var startedAtDate = startedAt.format('YYYY-MM-DD');
        var classNames = {
          line: CMP_CLASS[prodLine === line.id],
          quantity: CMP_CLASS[quantityDone === quantityPlanned],
          date: CMP_CLASS[startedAtDate === startAtDate],
          time: CMP_CLASS[startedAtTime >= fromTime && startedAtTime <= toTime]
        };

        shiftOrders.push({
          line: prodLine,
          quantityDone: quantityDone,
          startedAtTime: startedAt.format('HH:mm:ss'),
          startedAtDate: startedAtDate,
          startedAt: startedAt.valueOf(),
          classNames: classNames,
          ok: classNames.line === 'is-ok'
            && classNames.quantity === 'is-ok'
            && classNames.time === 'is-ok'
        });

        if (!ok)
        {
          ok = shiftOrders[shiftOrders.length - 1].ok;
        }
      });

      var cmpOpt = {numeric: true, ignorePunctuation: true};

      shiftOrders.sort((a, b) =>
      {
        if (a.line === line.id && b.line !== line.id)
        {
          return -1;
        }

        if (a.line !== line.id && b.line === line.id)
        {
          return 1;
        }

        var cmp = a.line.localeCompare(b.line, undefined, cmpOpt);

        if (cmp === 0)
        {
          cmp = a.startedAt - b.startedAt;
        }

        return cmp;
      });

      return {
        orderNo: orderNo,
        quantityPlanned: quantityPlanned,
        startAtTime: startAt.format('HH:mm:ss'),
        startAtDate: startAtDate,
        shiftOrders: shiftOrders,
        ok: ok
      };
    }

  });
});
