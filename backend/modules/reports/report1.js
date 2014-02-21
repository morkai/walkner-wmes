'use strict';

var step = require('h5.step');
var moment = require('moment');

var INTERVAL_STR_TO_NUM = {
  hour: 3600 * 1000,
  shift: 8 * 3600 * 1000,
  day: 24 * 3600 * 1000,
  week: 7 * 24 * 3600 * 1000
};

module.exports = function(mongoose, options, done)
{
  var ProdShift = mongoose.model('ProdShift');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');
  var FteMasterEntry = mongoose.model('FteMasterEntry');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var results = {
    options: options,
    coeffs: {},
    downtimes: {
      byAor: {},
      byReason: {}
    }
  };

  step(
    findProdShiftsStep,
    groupQuantitiesDoneStep,
    calcQuantitiesDoneStep,
    findProdDowntimesStep,
    groupDowntimesByOrdersStep,
    findProdShiftOrdersStep,
    groupProdShiftOrdersStep,
    calcDowntimeDurationsStep,
    findFteEntriesStep,
    groupFteEntriesStep,
    calcFteTotalsStep,
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

  function round(num)
  {
    num = Math.round(num * 1000) / 1000;

    return isNaN(num) ? 0 : num;
  }

  function isIgnoredDowntime(prodDowntime)
  {
    return options.ignoredDowntimeReasons.indexOf(prodDowntime.reason) !== -1;
  }

  function createConditions()
  {
    var conditions = {
      startedAt: {$gte: options.fromTime, $lt: options.toTime},
      finishedAt: {$ne: null}
    };

    if (options.orgUnitType && options.orgUnitId)
    {
      conditions[options.orgUnitType] = options.orgUnitId;
    }

    if (options.subdivisionType === 'prod')
    {
      conditions.mechOrder = false;
    }
    else if (options.subdivisionType === 'press')
    {
      conditions.mechOrder = true;
    }

    return conditions;
  }

  function findProdShiftsStep()
  {
    /*jshint validthis:true*/

    var conditions = {
      date: {$gte: options.fromTime, $lt: options.toTime}
    };

    if (options.orgUnitType && options.orgUnitId)
    {
      conditions[options.orgUnitType] = options.orgUnitId;
    }

    conditions.quantitiesDone = {$ne: null};

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

    var endTime =
      Math.min(moment().minutes(59).seconds(59).milliseconds(999).valueOf(), options.toTime);
    var groupedQuantitiesDone = {};

    prodShifts.forEach(function(prodShift)
    {
      var shiftStartTime = prodShift.date.getTime();

      prodShift.quantitiesDone.forEach(function(quantityDone, i)
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

    Object.keys(groupedQuantitiesDone).forEach(function(groupKey)
    {
      if (typeof results.coeffs[groupKey] === 'undefined')
      {
        results.coeffs[groupKey] = {quantityDone: 0};
      }

      groupedQuantitiesDone[groupKey].forEach(function(quantityDone)
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

    prodDowntimes.forEach(function(prodDowntime)
    {
      var duration =
        (prodDowntime.finishedAt.getTime() - prodDowntime.startedAt.getTime()) / 3600000;

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

    var fields = {
      startedAt: 1,
      finishedAt: 1,
      subdivision: 1,
      mechOrder: 1,
      orderId: 1,
      operationNo: 1,
      'orderData.operations': 1,
      workerCount: 1,
      quantityDone: 1
    };

    ProdShiftOrder.find(createConditions(), fields).sort({startedAt: 1}).lean().exec(this.next());
  }

  function groupProdShiftOrdersStep(err, prodShiftOrders)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.done(done, err);
    }

    this.orderToWorkerCount = {};
    this.groupedProdShiftOrders = groupProdShiftOrders(
      prodShiftOrders, this.orderToDowntimes, this.orderToWorkerCount
    );

    setImmediate(this.next());
  }

  function calcDowntimeDurationsStep()
  {
    /*jshint validthis:true*/

    var orderToDowntimes = this.orderToDowntimes;
    var orderToWorkerCount = this.orderToWorkerCount;

    Object.keys(orderToDowntimes).forEach(function(key)
    {
      var summary = {
        count: 0,
        duration: 0,
        breakCount: 0,
        breakDuration: 0
      };

      orderToDowntimes[key].forEach(function(prodDowntime)
      {
        var duration =
          (prodDowntime.finishedAt.getTime() - prodDowntime.startedAt.getTime()) / 3600000;

        if (isIgnoredDowntime(prodDowntime))
        {
          summary.breakCount += 1;
          summary.breakDuration += duration;
        }
        else
        {
          summary.count += 1;
          summary.duration += duration;

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
    Object.keys(results.downtimes.byAor).forEach(function(aor)
    {
      results.downtimes.byAor[aor] = round(results.downtimes.byAor[aor] / 8);
    });

    Object.keys(results.downtimes.byReason).forEach(function(reason)
    {
      results.downtimes.byReason[reason] = round(results.downtimes.byReason[reason] / 8);
    });
  }

  function findFteEntriesStep()
  {
    /*jshint validthis:true*/

    if (options.interval === 'hour')
    {
      return;
    }

    var masterConditions = {
      date: {$gte: options.fromTime, $lt: options.toTime}
    };

    if (options.subdivisions.length)
    {
      masterConditions.subdivision = {$in: options.subdivisions};
    }

    masterConditions.total = {$gt: 0};

    FteMasterEntry
      .find(masterConditions, {_id: 0, date: 1, shift: 1, total: 1})
      .lean()
      .exec(this.parallel());

    var leaderConditions = {
      date: {$gte: options.fromTime, $lt: options.toTime},
      'totals.overall': {$gt: 0}
    };

    FteLeaderEntry
      .find(leaderConditions, {_id: 0, date: 1, shift: 1, totals: 1})
      .lean()
      .exec(this.parallel());
  }

  function groupFteEntriesStep(err, fteMasterEntries, fteLeaderEntries)
  {
    /*jshint validthis:true*/

    if (options.interval === 'hour')
    {
      return;
    }

    if (err)
    {
      return this.done(done, err);
    }

    var groupedFteMasterEntries = {};
    var groupedFteLeaderEntries = {};

    fteMasterEntries.forEach(function(fteMasterEntry)
    {
      fteMasterEntry.startedAt = calcFteShiftStartedAt(fteMasterEntry);

      groupObjects(groupedFteMasterEntries, fteMasterEntry);
    });

    fteLeaderEntries.forEach(function(fteLeaderEntry)
    {
      fteLeaderEntry.startedAt = calcFteShiftStartedAt(fteLeaderEntry);

      groupObjects(groupedFteLeaderEntries, fteLeaderEntry);
    });

    this.groupedFteMasterEntries = groupedFteMasterEntries;
    this.groupedFteLeaderEntries = groupedFteLeaderEntries;

    setImmediate(this.next());
  }

  function calcFteTotalsStep()
  {
    /*jshint validthis:true*/

    if (options.interval === 'hour')
    {
      return;
    }

    var fteTotals = {};
    var groupedFteMasterEntries = this.groupedFteMasterEntries;
    var groupedFteLeaderEntries = this.groupedFteLeaderEntries;

    Object.keys(groupedFteMasterEntries).forEach(function(groupKey)
    {
      if (typeof fteTotals[groupKey] === 'undefined')
      {
        fteTotals[groupKey] = {master: 0, leader: 0};
      }

      groupedFteMasterEntries[groupKey].forEach(function(fteMasterEntry)
      {
        fteTotals[groupKey].master += fteMasterEntry.total;
      });
    });

    Object.keys(groupedFteLeaderEntries).forEach(function(groupKey)
    {
      if (typeof fteTotals[groupKey] === 'undefined')
      {
        fteTotals[groupKey] = {master: 0, leader: 0};
      }

      groupedFteLeaderEntries[groupKey].forEach(function(fteLeaderEntry)
      {
        if (typeof fteLeaderEntry.totals[options.division] === 'number')
        {
          fteTotals[groupKey].leader += fteLeaderEntry.totals[options.division];
        }
        else
        {
          fteTotals[groupKey].leader += fteLeaderEntry.totals.overall;
        }
      });
    });

    this.groupedFteMasterEntries = null;
    this.groupedFteLeaderEntries = null;
    this.fteTotals = fteTotals;

    setImmediate(this.next());
  }

  function calcCoeffsStep()
  {
    /*jshint validthis:true*/

    var orderToDowntimes = this.orderToDowntimes;
    var groupedProdShiftOrders = this.groupedProdShiftOrders;
    var fteTotals = this.fteTotals || {};

    this.orderToDowntimes = null;
    this.groupedProdShiftOrders = null;
    this.fteTotals = null;

    Object.keys(groupedProdShiftOrders).forEach(function(groupKey)
    {
      calcCoeffs(
        groupKey,
        groupedProdShiftOrders[groupKey],
        fteTotals[groupKey],
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

    var createNextGroupKey = createCreateNextGroupKey();
    var lastGroupKey = createGroupKey(options.fromTime);

    if (groupKeys[0] !== lastGroupKey)
    {
      pushEmptyCoeffs(lastGroupKey);
    }

    groupKeys.forEach(function(groupKey)
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

  function createCreateNextGroupKey()
  {
    if (options.interval === 'month')
    {
      return function(groupKey)
      {
        var date = new Date(groupKey);

        return date.setMonth(date.getMonth() + 1);
      };
    }

    return function(groupKey) { return groupKey + INTERVAL_STR_TO_NUM[options.interval]; };
  }

  function groupProdShiftOrders(prodShiftOrders, orderToDowntimes, orderToWorkerCount)
  {
    var groupedProdShiftOrders = {};

    prodShiftOrders.forEach(function(prodShiftOrder)
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
        mechOrder: order.mechOrder,
        orderId: order.orderId,
        operationNo: order.operationNo,
        orderData: order.orderData,
        workerCount: order.workerCount,
        quantityDone: order.quantityDone,
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

    orderDowntimes.forEach(function(downtime)
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
    var groupKey = createGroupKey(obj.startedAt);

    if (typeof groupedObjects[groupKey] === 'undefined')
    {
      groupedObjects[groupKey] = [];
    }

    groupedObjects[groupKey].push(obj);
  }

  function createGroupKey(date)
  {
    /*jshint -W015*/

    var groupKey = moment(date).lang('pl');
    var hours = groupKey.hours();

    groupKey.minutes(0).seconds(0).milliseconds(0);

    switch (options.interval)
    {
      case 'shift':
        if (hours >= 6 && hours < 14)
        {
          groupKey.hours(6);
        }
        else if (hours >= 14 && hours < 22)
        {
          groupKey.hours(14);
        }
        else
        {
          groupKey.hours(22);

          if (hours < 6)
          {
            groupKey.date(groupKey.date() - 1);
          }
        }
        break;

      case 'day':
        if (hours < 6)
        {
          groupKey.date(groupKey.date() - 1);
        }

        groupKey.hours(6);
        break;

      case 'week':
        var weekday = groupKey.weekday();

        if (weekday === 0 && hours < 6)
        {
          groupKey.date(groupKey.date() - 1);
        }

        groupKey.weekday(0).hours(6);
        break;

      case 'month':
        var dayOfMonth = groupKey.date();

        if (dayOfMonth === 1 && hours < 6)
        {
          groupKey.date(dayOfMonth - 1);
        }

        groupKey.date(1).hours(6);
        break;
    }

    return groupKey.valueOf();
  }

  function calcFteShiftStartedAt(fteEntry)
  {
    return new Date(fteEntry.date.getTime());
  }

  function calcCoeffs(groupKey, orders, fteTotals, orderToDowntimes)
  {
    /*jshint validthis:true*/

    var orderCount = 0;
    var downtimeCount = 0;
    var breakCount = 0;
    var effNum = 0;
    var effDen = 0;
    var dtNum = 0;
    var dtDen = 0;
    var lastOrderFinishedAt;

    orders.forEach(function(order)
    {
      if (!order.orderData || !order.orderData.operations)
      {
        return;
      }

      var operation = order.orderData.operations[order.operationNo];

      if (typeof operation === 'undefined'
        || typeof operation.laborTime !== 'number'
        || operation.laborTime <= 0)
      {
        return;
      }

      var duration = (order.finishedAt.getTime() - order.startedAt.getTime()) / 3600000;

      if (duration <= 0)
      {
        return;
      }

      var percent = typeof order.percent === 'number' ? order.percent : 1;
      var workerCount = order.workerCount * percent;

      if (workerCount === 0)
      {
        return;
      }

      var laborTime = operation.laborTime * percent;
      var quantityDone = order.quantityDone * percent;
      var orderDowntime = orderToDowntimes[order._id];

      if (typeof orderDowntime === 'object')
      {
        duration -= orderDowntime.breakDuration;

        dtNum += orderDowntime.duration * workerCount;
        dtDen += workerCount;

        downtimeCount += orderDowntime.count;
        breakCount += orderDowntime.breakCount;
      }

      effNum += laborTime / 100 * quantityDone;
      effDen += duration * workerCount;

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
      coeffs.efficiency = round(effNum / effDen);

      if (options.interval === 'hour')
      {
        var endOfHour = parseInt(groupKey, 10) + 3599999;
        var percent = 1 - lastOrderFinishedAt.getTime() / endOfHour;

        if (percent !== 0)
        {
          coeffs.efficiency *= percent;
        }
      }
    }

    if (dtNum && dtDen)
    {
      coeffs.downtime = round(dtNum / 8 / dtDen);
    }

    if (typeof fteTotals === 'object')
    {
      var prodNum = effNum / 8;
      var prodDen = fteTotals.master + (fteTotals.leader / options.prodDivisionCount);

      if (prodNum && prodDen)
      {
        coeffs.productivity = round(prodNum / prodDen);
      }

      coeffs.fteMasterTotal = fteTotals.master;
      coeffs.fteLeaderTotal = fteTotals.leader;
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
