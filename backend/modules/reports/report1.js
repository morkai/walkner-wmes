// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const util = require('./util');
const calcFte = require('./calcFte');

module.exports = function(mongoose, options, done)
{
  const ProdShift = mongoose.model('ProdShift');
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const ProdDowntime = mongoose.model('ProdDowntime');

  const results = {
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
    calcQuantitiesDoneStep,
    findProdDowntimesStep,
    findProdShiftOrdersStep,
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
    const conditions = {
      startedAt: {
        $gte: options.fromTime,
        $lt: options.toTime
      }
    };

    if (options.orgUnitType && options.orgUnitId)
    {
      const orgUnitProperty = options.orgUnitType === 'mrpController'
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
    const conditions = {
      date: {
        $gte: options.fromTime,
        $lt: options.toTime
      }
    };

    if (options.orgUnitType && options.orgUnitId)
    {
      const orgUnitProperty = options.orgUnitType === 'mrpController'
        ? 'mrpControllers'
        : options.orgUnitType;

      conditions[orgUnitProperty] = options.orgUnitId;
    }

    if (!options.ignoredOrgUnits.empty)
    {
      conditions.prodLine = {$nin: Object.keys(options.ignoredOrgUnits.prodLine)};
    }

    const fields = {
      _id: 0,
      date: 1,
      'quantitiesDone.actual': 1
    };

    const cursor = ProdShift.find(conditions, fields).lean().cursor();
    const next = _.once(this.next());
    const endTime = Math.min(moment().minutes(59).seconds(59).milliseconds(999).valueOf(), options.toTime);

    this.groupedQuantitiesDone = {};

    cursor.on('end', next);
    cursor.on('error', next);
    cursor.on('data', prodShift =>
    {
      const shiftStartTime = prodShift.date.getTime();

      for (let ii = 0; ii < 8; ++ii)
      {
        const startedAt = shiftStartTime + 3600 * 1000 * ii;

        if (startedAt + 3599999 <= endTime)
        {
          groupObjects(this.groupedQuantitiesDone, {
            startedAt: new Date(startedAt),
            count: prodShift.quantitiesDone[ii].actual
          });
        }
      }
    });
  }

  function calcQuantitiesDoneStep(err)
  {
    if (err)
    {
      return this.done(done, err);
    }

    const groupedQuantitiesDone = this.groupedQuantitiesDone;

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
    const conditions = createConditions();
    const fields = {
      _id: 1,
      prodShiftOrder: 1,
      aor: 1,
      reason: 1,
      startedAt: 1,
      finishedAt: 1
    };

    const cursor = ProdDowntime.find(conditions, fields).lean().cursor();
    const next = _.once(this.next());

    this.orderToDowntimes = {};

    cursor.on('end', next);
    cursor.on('error', next);
    cursor.on('data', prodDowntime =>
    {
      if (!prodDowntime.prodShiftOrder || !prodDowntime.finishedAt)
      {
        return;
      }

      const duration = (prodDowntime.finishedAt.getTime() - prodDowntime.startedAt.getTime()) / 3600000;

      if (duration <= 0)
      {
        return;
      }

      if (typeof this.orderToDowntimes[prodDowntime.prodShiftOrder] === 'undefined')
      {
        this.orderToDowntimes[prodDowntime.prodShiftOrder] = [];
      }

      this.orderToDowntimes[prodDowntime.prodShiftOrder].push(prodDowntime);
    });
  }

  function findProdShiftOrdersStep(err)
  {
    if (err)
    {
      return this.done(done, err);
    }

    const conditions = createConditions();

    const fields = {
      division: 1,
      startedAt: 1,
      finishedAt: 1,
      subdivision: 1,
      mechOrder: 1,
      orderId: 1,
      workerCount: 1,
      totalQuantity: 1,
      quantityDone: 1,
      laborTime: 1,
      machineTime: 1
    };

    const cursor = ProdShiftOrder.find(conditions, fields).lean().cursor();
    const next = _.once(this.next());

    this.orderToWorkerCount = {};
    this.groupedProdShiftOrders = {};

    cursor.on('end', next);
    cursor.on('error', next);
    cursor.on('data', prodShiftOrder =>
    {
      if (prodShiftOrder.workDuration === 0
        || prodShiftOrder.laborTime === 0
        || prodShiftOrder.workerCount === 0
        || prodShiftOrder.finishedAt === null)
      {
        return;
      }

      this.orderToWorkerCount[prodShiftOrder._id] = prodShiftOrder.workerCount;

      if (options.interval === 'hour')
      {
        splitProdShiftOrder(this.groupedProdShiftOrders, prodShiftOrder, this.orderToDowntimes);
      }
      else
      {
        groupObjects(this.groupedProdShiftOrders, prodShiftOrder);
      }
    });
  }

  function calcDowntimeDurationsStep(err)
  {
    if (err)
    {
      return this.done(done, err);
    }

    const orderToDowntimes = this.orderToDowntimes;
    const orderToWorkerCount = this.orderToWorkerCount;

    _.forEach(orderToDowntimes, function(prodDowntimes, key)
    {
      const summary = {
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
        const duration = (prodDowntime.finishedAt.getTime() - prodDowntime.startedAt.getTime()) / 3600000;

        if (options.downtimeReasons.breaks[prodDowntime.reason])
        {
          summary.breakCount += 1;
          summary.breakDuration += duration;
        }
        else
        {
          summary.count += 1;
          summary.duration += duration;

          const schedule = options.downtimeReasons.schedule[prodDowntime.reason];

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

          const workerCount = orderToWorkerCount[prodDowntime.prodShiftOrder];

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
    const downtimes = results.downtimes;

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
    calcFte(mongoose, options, this.next());
  }

  function calcCoeffsStep(err, fteResults)
  {
    if (err)
    {
      return this.done(done, err);
    }

    const orderToDowntimes = this.orderToDowntimes;
    const groupedProdShiftOrders = this.groupedProdShiftOrders;
    const fteGroupedResults = fteResults.grouped;

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
    const coeffsMap = results.coeffs;

    results.coeffs = [];

    const groupKeys = Object.keys(coeffsMap).map(v => +v).sort(function(a, b) { return a - b; });

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

    const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
    let lastGroupKey = util.createGroupKey(options.interval, options.fromTime);

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

      const coeffs = coeffsMap[groupKey];

      coeffs.key = new Date(groupKey).toISOString();

      results.coeffs.push(coeffs);

      lastGroupKey = groupKey;
    });

    setImmediate(this.next());
  }

  function splitProdShiftOrder(groupedProdShiftOrders, order, orderToDowntimes)
  {
    const startedAtHours = order.startedAt.getHours();
    const finishedAtHours = order.finishedAt.getHours();

    if (startedAtHours === finishedAtHours)
    {
      return groupObjects(groupedProdShiftOrders, order);
    }

    splitOrderDowntimes(order._id, orderToDowntimes);

    const totalDuration = order.finishedAt.getTime() - order.startedAt.getTime();
    const totalHours = countTotalHours(order, startedAtHours, finishedAtHours);

    const partDate = new Date(order.startedAt);

    for (let h = 0; h < totalHours; ++h)
    {
      const partStartTime = partDate.getTime();
      let partEndTime = -1;
      const partHours = partDate.getHours();

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

      const percent = (partEndTime - partStartTime) / totalDuration;

      groupObjects(groupedProdShiftOrders, {
        _id: order._id + '@' + partHours,
        startedAt: new Date(partStartTime),
        finishedAt: new Date(partEndTime),
        division: order.division,
        mechOrder: order.mechOrder,
        orderId: order.orderId,
        workerCount: order.workerCount,
        totalQuantity: order.totalQuantity,
        quantityDone: order.quantityDone,
        laborTime: order.laborTime,
        machineTime: order.machineTime,
        percent: percent
      });
    }
  }

  function splitOrderDowntimes(orderId, orderToDowntimes)
  {
    const orderDowntimes = orderToDowntimes[orderId];

    if (!Array.isArray(orderDowntimes))
    {
      return;
    }

    delete orderToDowntimes[orderId];

    _.forEach(orderDowntimes, function(downtime)
    {
      const startedAtHours = downtime.startedAt.getHours();
      const finishedAtHours = downtime.finishedAt.getHours();

      if (startedAtHours === finishedAtHours)
      {
        return pushDowntime(downtime);
      }

      const totalHours = countTotalHours(downtime, startedAtHours, finishedAtHours);
      const partDate = new Date(downtime.startedAt);

      for (let h = 0; h < totalHours; ++h)
      {
        const partStartTime = partDate.getTime();
        let partEndTime = -1;
        const partHours = partDate.getHours();

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
      const newOrderId = orderId + '@' + downtime.startedAt.getHours();

      if (!Array.isArray(orderToDowntimes[newOrderId]))
      {
        orderToDowntimes[newOrderId] = [];
      }

      orderToDowntimes[newOrderId].push(downtime);
    }
  }

  function countTotalHours(obj, startedAtHours, finishedAtHours)
  {
    let totalHours = -1;

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
    const groupKey = util.createGroupKey(options.interval, obj.startedAt);

    if (typeof groupedObjects[groupKey] === 'undefined')
    {
      groupedObjects[groupKey] = [];
    }

    groupedObjects[groupKey].push(obj);
  }

  function calcCoeffs(groupKey, orders, fteGroupResult, orderToDowntimes)
  {
    let orderCount = 0;
    let downtimeCount = 0;
    let breakCount = 0;
    let effNum = 0;
    let effDen = 0;
    let dtNum = 0;
    let dtDen = 0;
    let mmh = 0;
    let scheduledDtNum = 0;
    let unscheduledDtNum = 0;
    let lastOrderFinishedAt;

    _.forEach(orders, function(order)
    {
      let workDuration = (order.finishedAt.getTime() - order.startedAt.getTime()) / 3600000;
      const percent = typeof order.percent === 'number' ? order.percent : 1;
      const workerCount = order.workerCount * percent;
      const laborTime = order.laborTime * percent;
      const totalQuantity = order.totalQuantity * percent;
      const orderDowntime = orderToDowntimes[order._id];

      if (typeof orderDowntime === 'object')
      {
        workDuration -= orderDowntime.breakDuration;

        dtNum += orderDowntime.duration * workerCount;
        dtDen += workerCount;
        scheduledDtNum += orderDowntime.scheduledDuration * workerCount;
        unscheduledDtNum += orderDowntime.unscheduledDuration * workerCount;

        downtimeCount += orderDowntime.count;
        breakCount += orderDowntime.breakCount;
      }

      effNum += laborTime / 100 * totalQuantity;
      effDen += workDuration * workerCount;

      mmh += (order.machineTime * percent) / 100 * (order.quantityDone * percent);

      orderCount += 1;

      lastOrderFinishedAt = order.finishedAt;
    });

    if (orderCount === 0)
    {
      return;
    }

    const coeffs = typeof results.coeffs[groupKey] === 'undefined'
      ? (results.coeffs[groupKey] = {})
      : results.coeffs[groupKey];

    if (effNum && effDen)
    {
      coeffs.effNum = util.round(effNum);
      coeffs.effDen = util.round(effDen);
      coeffs.efficiency = util.round(effNum / effDen);

      if (options.interval === 'hour')
      {
        const startOfHour = parseInt(groupKey, 10);
        const endOfHour = startOfHour + 3599999;

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
      coeffs.prodDenTotal = util.round(fteGroupResult.prodDenTotal);
      coeffs.prodDenMaster = util.round(fteGroupResult.prodDenMaster);
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

    coeffs.mmh = util.round(mmh);
  }
};
