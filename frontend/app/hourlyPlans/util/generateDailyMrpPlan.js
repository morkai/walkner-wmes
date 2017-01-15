// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/data/orgUnits',
  './shift',
  './autoDowntimeCache'
], function(
  _,
  time,
  orgUnits,
  shiftUtil,
  autoDowntimeCache
) {
  'use strict';

  var debug = window.ENV !== 'production';
  var generating = false;

  return function generateDailyMrpPlan(plan)
  {
    /*jshint -W116*/

    if (debug)
    {
      console.clear();
    }

    if (generating)
    {
      if (debug)
      {
        console.log('Already generating...', plan.id);
      }

      return;
    }

    if (debug)
    {
      console.log('Generating...', plan.id);
    }

    var T = performance.now();
    var PLAN_DATE_TIME = plan.date.getTime();

    if (!plan.lines.length)
    {
      return false;
    }

    generating = true;

    var lines = plan.lines.filter(function(line) { return line.get('workerCount') > 0; }).map(function(line)
    {
      var prodLine = orgUnits.getByTypeAndId('prodLine', line.id);
      var subdivision = orgUnits.getSubdivisionFor(prodLine);
      var activeFromMoment = line.getActiveFromMoment();

      return {
        id: line.id,
        shiftNo: shiftUtil.getShiftNo(activeFromMoment.valueOf()),
        activeFrom: activeFromMoment,
        activeTo: line.getActiveToMoment(),
        workerCount: line.get('workerCount'),
        nextDowntime: autoDowntimeCache.get(subdivision, PLAN_DATE_TIME),
        orders: [],
        hourlyPlan: shiftUtil.EMPTY_HOURLY_PLAN.slice(),
        pceTimes: [],
        full: false
      };
    });

    if (!lines.length || !plan.orders.length)
    {
      plan.lines.invoke('reset');

      generating = false;

      return true;
    }

    var PER_ORDER_OVERHEAD = 30000;
    var SHIFT_OPTIONS = {
      1: {
        START_TIME: new Date(PLAN_DATE_TIME).setHours(6),
        START_DOWNTIME: 5 * 60000,
        END_DOWNTIME: 5 * 60000
      },
      2: {
        START_TIME: new Date(PLAN_DATE_TIME).setHours(14),
        START_DOWNTIME: 5 * 60000,
        END_DOWNTIME: 5 * 60000
      },
      3: {
        START_TIME: new Date(PLAN_DATE_TIME).setHours(22),
        START_DOWNTIME: 5 * 60000,
        END_DOWNTIME: 5 * 60000
      }
    };
    var IGNORE_DLV = false;
    var IGNORE_CNF = false;
    var IGNORE_DONE = false;
    var QTY_REMAINING = false;
    var BIG_ORDER_QTY = 70;

    var orders = plan.orders.models.slice();

    while (step());

    if (debug)
    {
      console.log('generateDailyMrpPlan', plan.id, Math.round((performance.now() - T) * 1000) / 1000);
    }

    lines.forEach(function(line)
    {
      var planLine = plan.lines.get(line.id);

      planLine.set({
        hourlyPlan: line.hourlyPlan,
        pceTimes: line.pceTimes,
        totalQty: line.pceTimes.length / 2
      });
      planLine.orders.reset(line.orders);
    });

    generating = false;

    return true;

    function step()
    {
      var currentOrder = getNextOrder();

      if (debug) console.log('step');

      if (!currentOrder)
      {
        if (debug) console.log('done');

        return false;
      }

      var qtyTodo = currentOrder.get('qtyTodo');
      var qtyDone = currentOrder.get('qtyDone');
      var qtyRemaining = qtyTodo - qtyDone;

      if (qtyRemaining <= 0)
      {
        qtyRemaining = qtyTodo;
      }

      var qty = QTY_REMAINING ? qtyRemaining : qtyTodo;

      if (debug)
        console.log(currentOrder.id, 'qty=', qty, 'todo=', qtyTodo, 'done=', qtyDone, 'remaining=', qtyRemaining);

      if (qty > BIG_ORDER_QTY)
      {
        handleBigOrder(currentOrder, qty);
      }
      else
      {
        handleSmallOrder(currentOrder, qty);
      }

      return true;
    }

    function handleBigOrder(currentOrder, qty)
    {
      if (debug) console.log('BIG');

      var availableLines = getAvailableLines();

      if (availableLines.length === 0)
      {
        if (debug) console.log('no available lines');

        return false;
      }

      if (availableLines.length === 1)
      {
        if (debug) console.log('single line available');

        return handleSmallOrder(currentOrder, qty);
      }

      if (availableLines.length === 2)
      {
        if (debug) console.log('two lines available', _.pluck(availableLines, 'id'));

        return splitTotalQty(qty, 2).forEach(function(partialQty)
        {
          handleSmallOrder(currentOrder, partialQty);
        });
      }

      if (debug) console.log('%d available lines', availableLines.length, _.pluck(availableLines, 'id'));

      var all = [];

      for (var lineCount = 2; lineCount <= availableLines.length; ++lineCount)
      {
        /* jshint -W083 */
        var lines = [];
        var candidates = splitTotalQty(qty, lineCount).map(function(partialQty, lineIndex)
        {
          var line = availableLines[lineIndex];

          lines.push(line);

          return trySmallOrderOnLine(currentOrder, partialQty, availableLines[lineIndex]);
        });
        var allOrderCount = 0;
        var bigOrderCount = 0;
        var rank = 0;

        candidates.forEach(function(candidate)
        {
          allOrderCount += candidate.orders.length;

          _.forEach(candidate.orders, function(order)
          {
            if (order.qty > BIG_ORDER_QTY)
            {
              bigOrderCount += 1;
            }
          });
        });

        if (allOrderCount === lineCount)
        {
          rank += 1;
        }

        if (bigOrderCount === 0)
        {
          rank += 2;
        }

        all.push({
          allOrderCount: allOrderCount,
          bigOrderCount: bigOrderCount,
          lineCount: lines.length,
          rank: rank,
          lines: lines,
          candidates: candidates
        });

        if (debug) console.log('candidate', 'rank=', rank, 'lines=', _.pluck(lines, 'id'), candidates);

        if (rank === 3)
        {
          if (debug) console.log('rank 3!');

          break;
        }
        /* jshint +W083 */
      }

      all.sort(function(a, b)
      {
        if (a.rank === b.rank)
        {
          if (a.candidates.length === b.lines.length)
          {
            return b.allOrderCount - a.allOrderCount;
          }

          return b.lineCount - a.lineCount;
        }

        return b.rank - a.rank;
      });

      var best = all[0];

      if (debug) console.log('best', best);

      best.candidates.forEach(function(candidate, i)
      {
        mergeCandidateWithLine(candidate, best.lines[i]);
      });
    }

    function handleSmallOrder(currentOrder, qty)
    {
      if (debug) console.log('SMALL');

      var availableLines = getAvailableLines();

      if (availableLines.length === 0)
      {
        if (debug) console.log('no available lines');

        return false;
      }

      for (var i = 0; i < availableLines.length; ++i)
      {
        var line = availableLines[i];
        var candidate = trySmallOrderOnLine(currentOrder, qty, line);

        if (candidate)
        {
          mergeCandidateWithLine(candidate, line);

          break;
        }
      }

      return true;
    }

    function mergeCandidateWithLine(candidate, line)
    {
      if (hasIncompleteOrder(line.orders) && hasIncompleteOrder(candidate.orders))
      {
        if (debug) console.log('merge: ignore incomplete');

        return;
      }

      if (debug) console.log('merging', candidate.orders[0].orderNo, 'with', line.id, line);

      line.shiftNo = candidate.shiftNo;
      line.activeFrom = candidate.activeFrom;
      line.nextDowntime = candidate.nextDowntime;
      line.orders = line.orders.concat(candidate.orders);
      line.full = candidate.full;
      line.pceTimes = line.pceTimes.concat(candidate.pceTimes);

      for (var h = 0; h < 24; ++h)
      {
        line.hourlyPlan[h] += candidate.hourlyPlan[h];
      }
    }

    function trySmallOrderOnLine(currentOrder, qty, line)
    {
      if (debug) console.log('try small order', currentOrder.id, 'qty=', qty, 'line=', line);

      var pceTime = currentOrder.getPceTime(line.workerCount);
      var shiftNo = line.shiftNo;
      var nextDowntime = line.nextDowntime;
      var activeTo = line.activeTo.valueOf();
      var full = false;
      var startAt = line.activeFrom.valueOf();
      var finishAt = startAt + getOrderOverhead(line);
      var q = 0;
      var lineOrders = [];
      var hourlyPlan = shiftUtil.EMPTY_HOURLY_PLAN.slice();
      var pceTimes = [];

      while (q <= qty)
      {
        var newFinishAt = finishAt + pceTime;

        while (nextDowntime)
        {
          if (nextDowntime.startAt <= newFinishAt)
          {
            newFinishAt += nextDowntime.duration;
            nextDowntime = nextDowntime.next;

            continue;
          }

          break;
        }

        var newFinishDate = new Date(newFinishAt);
        var h = newFinishDate.getHours();

        // TODO try to assign the remaining qty to a different line
        if (newFinishAt > activeTo || (shiftNo === 3 && h >= 6 && h < 22))
        {
          if (q > 0)
          {
            lineOrders.push({
              _id: currentOrder.id + '-' + shiftNo,
              orderNo: currentOrder.id,
              qty: q,
              startAt: new Date(startAt),
              finishAt: new Date(finishAt),
              pceTime: pceTime,
              incomplete: qty - q
            });
          }

          full = true;

          break;
        }

        if ((shiftNo === 1 && h >= 14) || (shiftNo === 2 && (h >= 22 || h < 6)))
        {
          if (q === 0)
          {
            shiftNo += 1;
            startAt = SHIFT_OPTIONS[shiftNo].START_TIME;
            finishAt = startAt + SHIFT_OPTIONS[shiftNo].START_DOWNTIME;
          }
          else
          {
            lineOrders.push({
              _id: currentOrder.id + '-' + shiftNo,
              orderNo: currentOrder.id,
              qty: q,
              startAt: new Date(startAt),
              finishAt: new Date(finishAt),
              pceTime: pceTime,
              incomplete: false
            });

            shiftNo += 1;
            startAt = SHIFT_OPTIONS[shiftNo].START_TIME;
            finishAt = startAt + PER_ORDER_OVERHEAD;
            qty -= q;
            q = 0;
          }

          continue;
        }

        if (q === qty)
        {
          lineOrders.push({
            _id: currentOrder.id + '-' + shiftNo,
            orderNo: currentOrder.id,
            qty: q,
            startAt: new Date(startAt),
            finishAt: new Date(finishAt),
            pceTime: pceTime,
            incomplete: false
          });

          break;
        }

        finishAt = newFinishAt;
        q += 1;

        pceTimes.push(h, newFinishDate.getMinutes());
        hourlyPlan[shiftUtil.HOUR_TO_INDEX[h]] += 1;
      }

      if (!lineOrders.length)
      {
        return null;
      }

      return {
        shiftNo: shiftNo,
        activeFrom: time.getMoment(_.last(lineOrders).finishAt.getTime()),
        nextDowntime: nextDowntime,
        orders: lineOrders,
        full: full,
        hourlyPlan: hourlyPlan,
        pceTimes: pceTimes
      };
    }

    function getNextOrder()
    {
      while (orders.length)
      {
        var order = orders.shift();

        if ((IGNORE_DONE && order.isCompleted())
          || (IGNORE_CNF && order.isConfirmed())
          || (IGNORE_DLV && order.isDelivered())
          || !order.isValid())
        {
          if (debug) console.log('ignoring order:', order.id);

          continue;
        }

        return order;
      }

      return null;
    }

    function getOrderOverhead(line)
    {
      if (line.orders.length)
      {
        return PER_ORDER_OVERHEAD;
      }

      var shiftOptions = SHIFT_OPTIONS[line.shiftNo];

      if (!shiftOptions.START_DOWNTIME)
      {
        return PER_ORDER_OVERHEAD;
      }

      var orderStartAt = line.activeFrom.valueOf();
      var startDowntimeFinishAt = shiftOptions.START_TIME + shiftOptions.START_DOWNTIME;

      if (orderStartAt >= startDowntimeFinishAt)
      {
        return PER_ORDER_OVERHEAD;
      }

      return shiftOptions.START_DOWNTIME - (orderStartAt - shiftOptions.START_TIME);
    }

    function splitTotalQty(totalQty, lineCount)
    {
      var perLineQty = Math.floor(totalQty / lineCount);
      var partialQty = _.map(new Array(lineCount), function() { return perLineQty; });
      var remainingQty = totalQty % lineCount;
      var i = 0;

      while (remainingQty)
      {
        partialQty[i++] += 1;
        remainingQty -= 1;

        if (i === lineCount)
        {
          i = 0;
        }
      }

      return partialQty;
    }

    function getAvailableLines()
    {
      return lines.filter(function(line) { return !line.full; }).sort(byActiveTime);
    }

    function byActiveTime(a, b)
    {
      return a.activeFrom.valueOf() - b.activeFrom.valueOf();
    }

    function hasIncompleteOrder(orders)
    {
      var lastOrder = _.last(orders);

      return lastOrder ? (lastOrder.incomplete > 0) : false;
    }
  };
});
