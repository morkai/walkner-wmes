// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

/* eslint-disable curly */

define([
  'underscore',
  'app/time',
  'app/data/orgUnits',
  './shift',
  './autoDowntimeCache',
  '../DailyMrpPlanOrder'
], function(
  _,
  time,
  orgUnits,
  shiftUtil,
  autoDowntimeCache,
  DailyMrpPlanOrder
) {
  'use strict';

  var debug = window.ENV !== 'production';
  var generating = false;

  return function generateDailyMrpPlan(plan, settings)
  {
    if (generating)
    {
      if (debug) console.log('Already generating...', plan.id);

      return;
    }

    if (debug) console.log('Generating...', plan.id, settings);

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
      var autoDowntimes = settings.lineAutoDowntimes[prodLine.id] || subdivision.get('autoDowntimes') || [];

      return {
        id: line.id,
        shiftNo: shiftUtil.getShiftNo(activeFromMoment.valueOf()),
        activeFrom: activeFromMoment,
        activeTo: line.getActiveToMoment(),
        workerCount: line.get('workerCount'),
        autoDowntimes: autoDowntimes,
        nextDowntime: autoDowntimeCache.get(prodLine, PLAN_DATE_TIME, autoDowntimes),
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

    var PER_ORDER_OVERHEAD = settings.perOrderOverhead || 0;
    var SHIFT_OPTIONS = {
      1: {
        START_TIME: new Date(PLAN_DATE_TIME).setHours(6),
        START_DOWNTIME: settings.shiftStartDowntime[1] || 0
      },
      2: {
        START_TIME: new Date(PLAN_DATE_TIME).setHours(14),
        START_DOWNTIME: settings.shiftStartDowntime[2] || 0
      },
      3: {
        START_TIME: new Date(PLAN_DATE_TIME).setHours(22),
        START_DOWNTIME: settings.shiftStartDowntime[3] || 0
      }
    };
    var IGNORE_DLV = !!settings.ignoreDlv;
    var IGNORE_CNF = !!settings.ignoreCnf;
    var IGNORE_DONE = !!settings.ignoreDone;
    var QTY_REMAINING = !!settings.qtyRemaining;
    var BIG_ORDER_QTY = settings.bigOrderQty || 0;

    var orders = plan.orders.models.slice();

    while (step());

    if (debug) console.log('Plan generated:', plan.id, Math.round((performance.now() - T) * 1000) / 1000);

    lines.forEach(function(line)
    {
      var planLine = plan.lines.get(line.id);

      planLine.set({
        hourlyPlan: line.hourlyPlan,
        pceTimes: line.pceTimes,
        totalQty: line.pceTimes.length / 2,
        downtimes: line.autoDowntimes
      });
      planLine.orders.reset(line.orders, {skipGenerate: true});
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

      var qtyPlan = currentOrder.get('qtyPlan');
      var qtyTodo = qtyPlan > 0 ? qtyPlan : currentOrder.get('qtyTodo');
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
        var lines = [];
        var candidates = splitTotalQty(qty, lineCount).map(function(partialQty, lineIndex) // eslint-disable-line no-loop-func
        {
          var line = availableLines[lineIndex];

          lines.push(line);

          return trySmallOrderOnLine(currentOrder, partialQty, availableLines[lineIndex]);
        });
        var allOrderCount = 0;
        var bigOrderCount = 0;
        var incompleteOrderCount = 0;
        var rank = 0;

        candidates.forEach(function(candidate) // eslint-disable-line no-loop-func
        {
          allOrderCount += candidate.orders.length;

          _.forEach(candidate.orders, function(order)
          {
            if (order.qty > BIG_ORDER_QTY)
            {
              bigOrderCount += 1;
            }

            if (order.incomplete)
            {
              incompleteOrderCount += 1;
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

        if (incompleteOrderCount === 0)
        {
          rank += 1;
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

        if (rank === 4)
        {
          if (debug) console.log('rank 4!');

          break;
        }
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
        mergeCandidateWithLine(currentOrder, candidate, best.lines[i]);
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
          mergeCandidateWithLine(currentOrder, candidate, line);

          break;
        }
      }

      return true;
    }

    function mergeCandidateWithLine(currentOrder, candidate, line)
    {
      if (hasIncompleteOrder(line.orders) && hasIncompleteOrder(candidate.orders))
      {
        if (debug) console.log('merge: ignore incomplete');

        return;
      }

      var lastOrder = _.last(line.orders);
      var firstCandidateOrder = _.first(candidate.orders);

      if (line.prev && lastOrder && lastOrder.orderNo === firstCandidateOrder.orderNo)
      {
        if (debug) console.log(
          'merge: candidate', firstCandidateOrder.orderNo, firstCandidateOrder,
          'same as the last order', lastOrder,
          'on line', line.id, line,
          'need to backtrack'
        );

        return mergeBacktrack(currentOrder, candidate, line);
      }

      if (debug) console.log('merging', candidate.orders[0].orderNo, 'with', line.id, line);

      line.prev = {
        shiftNo: line.shiftNo,
        activeFrom: line.activeFrom,
        nextDowntime: line.nextDowntime,
        orders: line.orders,
        full: line.full,
        pceTimes: line.pceTimes,
        hourlyPlan: [].concat(line.hourlyPlan),
        incomplete: null
      };
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

      handleIncompleteOrder(line, _.last(line.orders));
    }

    // TODO: smarter
    function mergeBacktrack(currentOrder, candidate, line)
    {
      var prev = line.prev;

      if (debug) console.log('merge: backtracing:', prev);

      if (prev.incomplete)
      {
        orders.shift();
      }

      var lastOrder = _.last(line.orders);
      var firstCandidateOrder = _.first(candidate.orders);

      line.prev = null;
      line.shiftNo = prev.shiftNo;
      line.activeFrom = prev.activeFrom;
      line.nextDowntime = prev.nextDowntime;
      line.orders = prev.orders;
      line.full = prev.full;
      line.pceTimes = prev.pceTimes;
      line.hourlyPlan = prev.hourlyPlan;

      var newCandidate = trySmallOrderOnLine(currentOrder, lastOrder.qty + firstCandidateOrder.qty, line);

      mergeCandidateWithLine(currentOrder, newCandidate, line);
    }

    function handleIncompleteOrder(line, lineOrder)
    {
      if (!lineOrder.incomplete)
      {
        return;
      }

      if (debug) console.log('INCOMPLETE');

      var order = plan.orders.get(lineOrder.orderNo).toJSON();
      var partialLineOrder = new DailyMrpPlanOrder(order);

      partialLineOrder.set({
        qtyDone: 0,
        qtyPlan: lineOrder.incomplete
      });

      var availableLines = getAvailableLines();

      if (availableLines.length === 0)
      {
        if (debug) console.log('no available lines');

        return;
      }

      if (trySmallOrderOnLine(partialLineOrder, lineOrder.incomplete, availableLines[0]))
      {
        if (debug) console.log('found room on line:', availableLines[0].id);

        line.prev.incomplete = partialLineOrder;
        lineOrder.incomplete = 0;

        orders.unshift(partialLineOrder);
      }
      else if (debug) console.log('no more room');
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

        if (newFinishAt > activeTo || (shiftNo === 3 && h >= 6 && h < 22))
        {
          if (q > 0)
          {
            if (debug) console.log('push a', q);

            lineOrders.push({
              _id: currentOrder.id + '-' + shiftNo + '-' + (1 + line.orders.length + lineOrders.length),
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
            if (debug) console.log('first pce crossing shifts');

            shiftNo += 1;
            startAt = SHIFT_OPTIONS[shiftNo].START_TIME;
            finishAt = startAt + SHIFT_OPTIONS[shiftNo].START_DOWNTIME;
          }
          else
          {
            if (debug) console.log('push b', q);

            lineOrders.push({
              _id: currentOrder.id + '-' + shiftNo + '-' + (1 + line.orders.length + lineOrders.length),
              orderNo: currentOrder.id,
              qty: q,
              startAt: new Date(startAt),
              finishAt: new Date(finishAt),
              pceTime: pceTime,
              incomplete: false
            });

            if (qty - q === 0)
            {
              break;
            }

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
          if (debug) console.log('push c', q);

          lineOrders.push({
            _id: currentOrder.id + '-' + shiftNo + '-' + (1 + line.orders.length + lineOrders.length),
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

        if (!order.isValid())
        {
          if (debug) console.log('ignoring invalid order:', order.id);

          continue;
        }

        if (order.get('qtyPlan') > 0)
        {
          return order;
        }

        if (order.isIgnored()
          || (IGNORE_DONE && order.isCompleted())
          || (IGNORE_CNF && order.isConfirmed())
          || (IGNORE_DLV && order.isDelivered()))
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
