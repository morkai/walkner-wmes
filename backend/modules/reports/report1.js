// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var util = require('./util');
var calcFte = require('./calcFte');

module.exports = function(mongoose, options, done)
{
  var ProdShift = mongoose.model('ProdShift');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');

  var results = {
    options: options,
    coeffs: {},
    downtimes: {
      byAor: {},
      byReason: {}
    }
  };

  if (options.orgUnitType && options.ignoredOrgUnits[options.orgUnitType][options.orgUnitId])
  {
    return done(null, results);
  }

  step(
    findProdShiftsStep,
    groupQuantitiesDoneStep,
    calcQuantitiesDoneStep,
    findProdDowntimesStep,
    groupDowntimesByOrdersStep,
    findProdShiftOrdersStep,
    groupProdShiftOrdersStep,
    calcDowntimeDurationsStep,
    calcFteStep,
    calcCoeffsStep,
    sortCoeffsStep,
    function sendResultsStep(err)
    {
      if (err)
      {
        done(err, null);
      }
      else
      {
        done(null, results);
      }
    }
  );

  function createConditions()
  {
    var conditions = {
      startedAt: {
        $gte: options.fromTime,
        $lt: options.toTime
      }
    };

    if (options.orgUnitType && options.orgUnitId)
    {
      var orgUnitProperty = options.orgUnitType === 'mrpController'
        ? 'mrpControllers'
        : options.orgUnitType;

      conditions[orgUnitProperty] = options.orgUnitId;
    }

    if (!options.ignoredOrgUnits.empty)
    {
      conditions.prodLine = {$nin: Object.keys(options.ignoredOrgUnits.prodLine)};
    }

    return conditions;
  }

  function findProdShiftsStep()
  {
    /*jshint validthis:true*/

    var conditions = {
      date: {
        $gte: options.fromTime,
        $lt: options.toTime
      }
    };

    if (options.orgUnitType && options.orgUnitId)
    {
      var orgUnitProperty = options.orgUnitType === 'mrpController'
        ? 'mrpControllers'
        : options.orgUnitType;

      conditions[orgUnitProperty] = options.orgUnitId;
    }

    if (!options.ignoredOrgUnits.empty)
    {
      conditions.prodLine = {$nin: Object.keys(options.ignoredOrgUnits.prodLine)};
    }

    var fields = {
      _id: 0,
      date: 1,
      'quantitiesDone.actual': 1
    };

    ProdShift.find(conditions, fields).sort({date: 1}).lean().exec(this.next());
  }

  function groupQuantitiesDoneStep(err, prodShifts)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.done(done, err);
    }

    var endTime = Math.min(moment().minutes(59).seconds(59).milliseconds(999).valueOf(), options.toTime);
    var groupedQuantitiesDone = {};

    _.forEach(prodShifts, function(prodShift)
    {
      var shiftStartTime = prodShift.date.getTime();

      _.forEach(prodShift.quantitiesDone, function(quantityDone, i)
      {
        var startedAt = shiftStartTime + 3600 * 1000 * i;

        if (startedAt + 3599999 <= endTime)
        {
          groupObjects(groupedQuantitiesDone, {
            startedAt: new Date(startedAt),
            count: quantityDone.actual
          });
        }
      });
    });

    this.groupedQuantitiesDone = groupedQuantitiesDone;

    setImmediate(this.next());
  }

  function calcQuantitiesDoneStep()
  {
    /*jshint validthis:true*/

    var groupedQuantitiesDone = this.groupedQuantitiesDone;

    _.forEach(groupedQuantitiesDone, function(quantitiesDone, groupKey)
    {
      if (typeof results.coeffs[groupKey] === 'undefined')
      {
        results.coeffs[groupKey] = {quantityDone: 0};
      }

      _.forEach(quantitiesDone, function(quantityDone)
      {
        results.coeffs[groupKey].quantityDone += quantityDone.count;
      });

      if (results.coeffs[groupKey].quantityDone === 0)
      {
        results.coeffs[groupKey].quantityDone = undefined;
      }
    });

    this.groupedQuantitiesDone = null;

    setImmediate(this.next());
  }

  function findProdDowntimesStep()
  {
    /*jshint validthis:true*/

    var conditions = createConditions();

    conditions.prodShiftOrder = {$ne: null};
    conditions.finishedAt = {$ne: null};

    var fields = {
      _id: 1,
      prodShiftOrder: 1,
      aor: 1,
      reason: 1,
      startedAt: 1,
      finishedAt: 1
    };

    ProdDowntime.find(conditions, fields).lean().exec(this.next());
  }

  function groupDowntimesByOrdersStep(err, prodDowntimes)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.done(done, err);
    }

    var orderToDowntimes = {};

    _.forEach(prodDowntimes, function(prodDowntime)
    {
      var duration = (prodDowntime.finishedAt.getTime() - prodDowntime.startedAt.getTime()) / 3600000;

      if (duration <= 0)
      {
        return;
      }

      if (typeof orderToDowntimes[prodDowntime.prodShiftOrder] === 'undefined')
      {
        orderToDowntimes[prodDowntime.prodShiftOrder] = [];
      }

      orderToDowntimes[prodDowntime.prodShiftOrder].push(prodDowntime);
    });

    this.orderToDowntimes = orderToDowntimes;

    setImmediate(this.next());
  }

  function findProdShiftOrdersStep()
  {
    /*jshint validthis:true*/

    var conditions = createConditions();

    conditions.workDuration = {$ne: 0};
    conditions.laborTime = {$ne: 0};
    conditions.workerCount = {$ne: 0};

    var fields = {
      division: 1,
      startedAt: 1,
      finishedAt: 1,
      subdivision: 1,
      mechOrder: 1,
      orderId: 1,
      workerCount: 1,
      totalQuantity: 1,
      laborTime: 1
    };

    ProdShiftOrder.find(conditions, fields).sort({startedAt: 1}).lean().exec(this.next());
  }

  function groupProdShiftOrdersStep(err, prodShiftOrders)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.done(done, err);
    }

    this.orderToWorkerCount = {};
    this.groupedProdShiftOrders = groupProdShiftOrders(prodShiftOrders, this.orderToDowntimes, this.orderToWorkerCount);

    setImmediate(this.next());
  }

  function calcDowntimeDurationsStep()
  {
    /*jshint validthis:true*/

    var orderToDowntimes = this.orderToDowntimes;
    var orderToWorkerCount = this.orderToWorkerCount;

    _.forEach(orderToDowntimes, function(prodDowntimes, key)
    {
      var summary = {
        count: 0,
        duration: 0,
        breakCount: 0,
        breakDuration: 0,
        scheduledCount: 0,
        scheduledDuration: 0,
        unscheduledCount: 0,
        unscheduledDuration: 0
      };

      _.forEach(prodDowntimes, function(prodDowntime)
      {
        var duration = (prodDowntime.finishedAt.getTime() - prodDowntime.startedAt.getTime()) / 3600000;

        if (options.downtimeReasons.breaks[prodDowntime.reason])
        {
          summary.breakCount += 1;
          summary.breakDuration += duration;
        }
        else
        {
          summary.count += 1;
          summary.duration += duration;

          var schedule = options.downtimeReasons.schedule[prodDowntime.reason];

          if (schedule === true)
          {
            summary.scheduledCount += 1;
            summary.scheduledDuration += duration;
          }
          else if (schedule === false)
          {
            summary.unscheduledCount += 1;
            summary.unscheduledDuration += duration;
          }

          var workerCount = orderToWorkerCount[prodDowntime.prodShiftOrder];

          if (typeof workerCount === 'number')
          {
            incrementDowntimeFte(prodDowntime.aor, prodDowntime.reason, duration * workerCount);
          }
        }
      });

      orderToDowntimes[key] = summary;
    });

    divDowntimeFte();

    setImmediate(this.next());
  }

  function incrementDowntimeFte(aor, reason, fte)
  {
    if (typeof results.downtimes.byAor[aor] === 'undefined')
    {
      results.downtimes.byAor[aor] = 0;
    }

    if (typeof results.downtimes.byReason[reason] === 'undefined')
    {
      results.downtimes.byReason[reason] = 0;
    }

    results.downtimes.byAor[aor] += fte;
    results.downtimes.byReason[reason] += fte;
  }

  function divDowntimeFte()
  {
    var downtimes = results.downtimes;

    _.forEach(downtimes.byAor, function(fte, aor)
    {
      downtimes.byAor[aor] = util.round(fte / 8);
    });

    _.forEach(downtimes.byReason, function(fte, reason)
    {
      downtimes.byReason[reason] = util.round(fte / 8);
    });
  }

  function calcFteStep()
  {
    /*jshint validthis:true*/

    calcFte(mongoose, options, this.next());
  }

  function calcCoeffsStep(err, fteResults)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.done(done, err);
    }

    var orderToDowntimes = this.orderToDowntimes;
    var groupedProdShiftOrders = this.groupedProdShiftOrders;
    var fteGroupedResults = fteResults.grouped;

    this.orderToDowntimes = null;
    this.groupedProdShiftOrders = null;

    _.forEach(groupedProdShiftOrders, function(prodShiftOrders, groupKey)
    {
      calcCoeffs(
        groupKey,
        prodShiftOrders,
        fteGroupedResults[groupKey],
        orderToDowntimes
      );
    });

    setImmediate(this.next());
  }

  function sortCoeffsStep()
  {
    /*jshint validthis:true*/

    var coeffsMap = results.coeffs;

    results.coeffs = [];

    var groupKeys = Object.keys(coeffsMap).map(Number).sort(function(a, b) { return a - b; });

    if (groupKeys.length === 0)
    {
      return;
    }

    function pushEmptyCoeffs(groupKey)
    {
      results.coeffs.push({
        key: new Date(groupKey).toISOString()
      });
    }

    var createNextGroupKey = util.createCreateNextGroupKey(options.interval);
    var lastGroupKey = util.createGroupKey(options.interval, options.fromTime);

    if (groupKeys[0] !== lastGroupKey)
    {
      pushEmptyCoeffs(lastGroupKey);
    }

    _.forEach(groupKeys, function(groupKey)
    {
      while (lastGroupKey < groupKey)
      {
        lastGroupKey = createNextGroupKey(lastGroupKey);

        if (lastGroupKey >= groupKey)
        {
          break;
        }

        pushEmptyCoeffs(lastGroupKey);
      }

      var coeffs = coeffsMap[groupKey];

      coeffs.key = new Date(groupKey).toISOString();

      results.coeffs.push(coeffs);

      lastGroupKey = groupKey;
    });

    setImmediate(this.next());
  }

  function groupProdShiftOrders(prodShiftOrders, orderToDowntimes, orderToWorkerCount)
  {
    var groupedProdShiftOrders = {};

    _.forEach(prodShiftOrders, function(prodShiftOrder)
    {
      orderToWorkerCount[prodShiftOrder._id] = prodShiftOrder.workerCount;

      if (options.interval === 'hour')
      {
        splitProdShiftOrder(groupedProdShiftOrders, prodShiftOrder, orderToDowntimes);
      }
      else
      {
        groupObjects(groupedProdShiftOrders, prodShiftOrder);
      }
    });

    return groupedProdShiftOrders;
  }

  function splitProdShiftOrder(groupedProdShiftOrders, order, orderToDowntimes)
  {
    var startedAtHours = order.startedAt.getHours();
    var finishedAtHours = order.finishedAt.getHours();

    if (startedAtHours === finishedAtHours)
    {
      return groupObjects(groupedProdShiftOrders, order);
    }

    splitOrderDowntimes(order._id, orderToDowntimes);

    var totalDuration = order.finishedAt.getTime() - order.startedAt.getTime();
    var totalHours = countTotalHours(order, startedAtHours, finishedAtHours);

    var partDate = new Date(order.startedAt);

    for (var h = 0; h < totalHours; ++h)
    {
      var partStartTime = partDate.getTime();
      var partEndTime = -1;
      var partHours = partDate.getHours();

      if (partHours === finishedAtHours)
      {
        partEndTime = order.finishedAt.getTime();
      }
      else
      {
        partDate.setHours(partHours + 1);
        partDate.setMinutes(0);
        partDate.setSeconds(0);
        partDate.setMilliseconds(0);

        partEndTime = partDate.getTime() - 1;
      }

      var percent = (partEndTime - partStartTime) / totalDuration;

      groupObjects(groupedProdShiftOrders, {
        _id: order._id + '@' + partHours,
        startedAt: new Date(partStartTime),
        finishedAt: new Date(partEndTime),
        division: order.division,
        mechOrder: order.mechOrder,
        orderId: order.orderId,
        workerCount: order.workerCount,
        totalQuantity: order.totalQuantity,
        laborTime: order.laborTime,
        percent: percent
      });
    }
  }

  function splitOrderDowntimes(orderId, orderToDowntimes)
  {
    var orderDowntimes = orderToDowntimes[orderId];

    if (!Array.isArray(orderDowntimes))
    {
      return;
    }

    delete orderToDowntimes[orderId];

    _.forEach(orderDowntimes, function(downtime)
    {
      var startedAtHours = downtime.startedAt.getHours();
      var finishedAtHours = downtime.finishedAt.getHours();

      if (startedAtHours === finishedAtHours)
      {
        return pushDowntime(downtime);
      }

      var totalHours = countTotalHours(downtime, startedAtHours, finishedAtHours);
      var partDate = new Date(downtime.startedAt);

      for (var h = 0; h < totalHours; ++h)
      {
        var partStartTime = partDate.getTime();
        var partEndTime = -1;
        var partHours = partDate.getHours();

        if (partHours === finishedAtHours)
        {
          partEndTime = downtime.finishedAt.getTime();
        }
        else
        {
          partDate.setHours(partHours + 1);
          partDate.setMinutes(0);
          partDate.setSeconds(0);
          partDate.setMilliseconds(0);

          partEndTime = partDate.getTime() - 1;
        }

        pushDowntime({
          prodShiftOrder: downtime.prodShiftOrder,
          startedAt: new Date(partStartTime),
          finishedAt: new Date(partEndTime),
          aor: downtime.aor,
          reason: downtime.reason
        });
      }
    });

    function pushDowntime(downtime)
    {
      var newOrderId = orderId + '@' + downtime.startedAt.getHours();

      if (!Array.isArray(orderToDowntimes[newOrderId]))
      {
        orderToDowntimes[newOrderId] = [];
      }

      orderToDowntimes[newOrderId].push(downtime);
    }
  }

  function countTotalHours(obj, startedAtHours, finishedAtHours)
  {
    var totalHours = -1;

    if (obj.startedAt.getDate() === obj.finishedAt.getDate())
    {
      totalHours = finishedAtHours - startedAtHours + 1;
    }
    else
    {
      totalHours = 24 - startedAtHours + finishedAtHours + 1;
    }

    return totalHours;
  }

  function groupObjects(groupedObjects, obj)
  {
    var groupKey = util.createGroupKey(options.interval, obj.startedAt);

    if (typeof groupedObjects[groupKey] === 'undefined')
    {
      groupedObjects[groupKey] = [];
    }

    groupedObjects[groupKey].push(obj);
  }

  function calcCoeffs(groupKey, orders, fteGroupResult, orderToDowntimes)
  {
    /*jshint validthis:true*/

    var orderCount = 0;
    var downtimeCount = 0;
    var breakCount = 0;
    var scheduledCount = 0;
    var unscheduledCount = 0;
    var effNum = 0;
    var effDen = 0;
    var dtNum = 0;
    var dtDen = 0;
    var scheduledDtNum = 0;
    var unscheduledDtNum = 0;
    var lastOrderFinishedAt;

    _.forEach(orders, function(order)
    {
      var workDuration = (order.finishedAt.getTime() - order.startedAt.getTime()) / 3600000;
      var percent = typeof order.percent === 'number' ? order.percent : 1;
      var workerCount = order.workerCount * percent;
      var laborTime = order.laborTime * percent;
      var totalQuantity = order.totalQuantity * percent;
      var orderDowntime = orderToDowntimes[order._id];

      if (typeof orderDowntime === 'object')
      {
        workDuration -= orderDowntime.breakDuration;

        dtNum += orderDowntime.duration * workerCount;
        dtDen += workerCount;
        scheduledDtNum += orderDowntime.scheduledDuration * workerCount;
        unscheduledDtNum += orderDowntime.unscheduledDuration * workerCount;

        downtimeCount += orderDowntime.count;
        breakCount += orderDowntime.breakCount;
        scheduledCount += orderDowntime.scheduledCount;
        unscheduledCount += orderDowntime.unscheduledCount;
      }

      effNum += laborTime / 100 * totalQuantity;
      effDen += workDuration * workerCount;

      orderCount += 1;

      lastOrderFinishedAt = order.finishedAt;
    });

    if (orderCount === 0)
    {
      return;
    }

    var coeffs = typeof results.coeffs[groupKey] === 'undefined'
      ? (results.coeffs[groupKey] = {})
      : results.coeffs[groupKey];

    if (effNum && effDen)
    {
      coeffs.effNum = util.round(effNum);
      coeffs.effDen = util.round(effDen);
      coeffs.efficiency = util.round(effNum / effDen);

      if (options.interval === 'hour')
      {
        var startOfHour = parseInt(groupKey, 10);
        var endOfHour = startOfHour + 3599999;

        coeffs.efficiency *= (lastOrderFinishedAt.getTime() - startOfHour) / (endOfHour - startOfHour);
      }
    }

    if (dtNum && dtDen)
    {
      coeffs.downtime = util.round(dtNum / 8 / dtDen);
      coeffs.scheduledDowntime = util.round(scheduledDtNum / 8 / dtDen);
      coeffs.unscheduledDowntime = util.round(unscheduledDtNum / 8 / dtDen);
    }

    if (effNum && fteGroupResult && fteGroupResult.prodDenTotal)
    {
      coeffs.productivity = util.round(effNum / options.prodNumConstant / fteGroupResult.prodDenTotal);
      coeffs.productivityNoWh = util.round(effNum / options.prodNumConstant / fteGroupResult.prodDenMaster);
      coeffs.prodNum = util.round(effNum / options.prodNumConstant);
      coeffs.prodDenTotal = fteGroupResult.prodDenTotal;
      coeffs.prodDenMaster = fteGroupResult.prodDenMaster;
    }

    coeffs.orderCount = orderCount;

    if (downtimeCount)
    {
      coeffs.downtimeCount = downtimeCount;
    }

    if (breakCount)
    {
      coeffs.breakCount = breakCount;
    }
  }
};
