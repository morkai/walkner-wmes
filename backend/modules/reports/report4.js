// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var util = require('./util');

module.exports = function(mongoose, options, done)
{
  /*jshint validthis:true*/

  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');

  var report4 = new Report4(options);

  step(
    prepareResultsStep,
    function finalizeResultsStep(err)
    {
      if (err)
      {
        return this.done(done, err);
      }

      report4.finalize(this.next());
    },
    function sendResultsStep(err)
    {
      if (err)
      {
        done(err, null);
      }
      else
      {
        done(null, report4);
      }
    }
  );

  function prepareResultsStep()
  {
    var conditions = {
      subdivision: {$in: options.subdivisions},
      startedAt: {
        $gte: new Date(options.fromTime + 6 * 3600 * 1000),
        $lt: new Date(options.toTime + 6 * 3600 * 1000)
      }
    };

    var orderFields = {
      laborTime: 1,
      quantityDone: 1,
      quantityLost: 1,
      workDuration: 1,
      losses: 1,
      master: 1,
      operators: 1,
      startedAt: 1,
      date: 1,
      shift: 1,
      division: 1,
      prodLine: 1,
      pressWorksheet: 1,
      notes: 1
    };
    var orderStream = ProdShiftOrder
      .find(conditions, orderFields)
      .sort({subdivision: 1, startedAt: -1})
      .lean()
      .cursor();
    var orderStreamDone = _.once(this.parallel());

    orderStream.on('error', orderStreamDone);
    orderStream.on('end', orderStreamDone);
    orderStream.on('data', report4.handleProdShiftOrder.bind(report4));

    var downtimeFields = {
      _id: 0,
      prodLine: 1,
      shift: 1,
      reason: 1,
      startedAt: 1,
      finishedAt: 1,
      master: 1,
      operators: 1
    };
    var downtimeStream = ProdDowntime
      .find(conditions, downtimeFields)
      .sort({subdivision: 1, startedAt: -1})
      .lean()
      .cursor();
    var downtimeStreamDone = _.once(this.parallel());

    downtimeStream.on('error', downtimeStreamDone);
    downtimeStream.on('end', downtimeStreamDone);
    downtimeStream.on('data', report4.handleProdDowntime.bind(report4));
  }
};

function Report4(options)
{
  /**
   * @type {object}
   */
  this.options = options;

  /**
   * @type {object}
   */
  this.results = {
    effAndProd: {},
    workTimes: {
      total: 0,
      sap: 0,
      otherWorks: 0,
      downtimes: {}
    },
    machineTimes: {},
    quantities: {
      good: 0,
      bad: 0,
      losses: {}
    },
    notes: {
      count: 0,
      worksheets: [],
      orders: []
    }
  };

  /**
   * @type {object.<string, boolean>|null}
   */
  this.users = this.prepareUsers(options);

  /**
   * @type {Array.<string>}
   */
  this.divisions = [];

  /**
   * @type {object.<string, string>}
   */
  this.lossReasons = {};

  /**
   * @type {object.<number, object>}
   */
  this.effAndProd = {};

  /**
   * @type {object.<string, Array.<number>>}
   */
  this.operatorAdjustingDurations = {};

  /**
   * @type {object.<string, Array.<number>>}
   */
  this.machineAdjustingDurations = {};
}

Report4.prototype.toJSON = function()
{
  return {
    options: {
      fromTime: this.options.fromTime,
      toTime: this.options.toTime,
      interval: this.options.interval,
      subdivisions: this.options.subdivisions,
      mode: this.options.mode,
      operators: this.options.operators,
      masters: this.options.masters,
      shift: this.options.shift,
      downtimeReasons: this.options.downtimeReasons,
      divisions: this.divisions,
      lossReasons: this.lossReasons
    },
    results: this.results
  };
};

Report4.prototype.prepareUsers = function(options)
{
  var userList = options[options.mode];

  if (!Array.isArray(userList))
  {
    return null;
  }

  var userMap = {};

  _.forEach(userList, function(user)
  {
    userMap[user._id] = true;
  });

  return userMap;
};

Report4.prototype.finalize = function(done)
{
  var report = this;
  var machineTimes = report.results.machineTimes;
  var machines = Object.keys(machineTimes);

  report.results.notes.worksheets = Object.keys(report.results.notes.worksheets);
  report.results.workTimes.sap = report.results.workTimes.total - report.results.workTimes.otherWorks;

  step(
    function calcOperatorAdjustingMedian()
    {
      for (var i = 0, l = machines.length; i < l; ++i)
      {
        var machine = machines[i];

        machineTimes[machine].operatorAdjustingMedian = report.calcMedian(report.operatorAdjustingDurations[machine]);
      }

      setImmediate(this.next());
    },
    function calcMachineAdjustingMedian()
    {
      for (var i = 0, l = machines.length; i < l; ++i)
      {
        var machine = machines[i];

        machineTimes[machine].machineAdjustingMedian = report.calcMedian(report.machineAdjustingDurations[machine]);
      }

      setImmediate(this.next());
    },
    function finalizeEffAndProdStep()
    {
      report.finalizeEffAndProd();

      setImmediate(this.next());
    },
    done
  );
};

Report4.prototype.calcMedian = function(durations)
{
  if (durations === undefined)
  {
    return 0;
  }

  var length = durations.length;

  if (length === 1)
  {
    return durations[0];
  }

  if (length === 2)
  {
    return (durations[0] + durations[1]) / 2;
  }

  durations.sort(function(a, b) { return a - b; });

  if (length % 2 === 0)
  {
    var middle2 = length / 2;
    var middle1 = middle2 - 1;

    return (durations[middle1] + durations[middle2]) / 2;
  }

  return durations[Math.floor(length / 2)];
};

Report4.prototype.finalizeEffAndProd = function()
{
  var createNextGroupKey = util.createCreateNextGroupKey(this.options.interval);
  var groupKeys = Object.keys(this.effAndProd).map(Number).sort(function(a, b) { return a - b; });
  var divisions = {};

  this.results.effAndProd = {};

  if (groupKeys.length === 0)
  {
    this.options.divisions = [];

    return;
  }

  var fromGroupKey = groupKeys[0];
  var toGroupKey = groupKeys[groupKeys.length - 1];

  while (fromGroupKey <= toGroupKey)
  {
    var groupKey = fromGroupKey.toString();
    var groupData = this.effAndProd[groupKey];
    var effAndProd = {};

    if (groupData)
    {
      var prodDen = Object.keys(groupData.prodDen).length;
      var shifts = Object.keys(groupData.shifts).length;

      effAndProd.eff = groupData.effDen ? (groupData.effNum / groupData.effDen) : 0;
      effAndProd.prod = prodDen ? (groupData.effNum / (this.options.prodNumConstant * shifts) / prodDen) : 0;

      var divisionIds = Object.keys(groupData.byDivision);

      for (var ii = 0, ll = divisionIds.length; ii < ll; ++ii)
      {
        var divisionId = divisionIds[ii];
        var divisionData = groupData.byDivision[divisionId];

        divisions[divisionId] = true;
        effAndProd[divisionId] = divisionData.effNum / divisionData.effDen;
      }
    }

    this.results.effAndProd[groupKey] = effAndProd;

    fromGroupKey = createNextGroupKey(fromGroupKey);
  }

  this.options.divisions = Object.keys(divisions);
};

Report4.prototype.handleProdShiftOrder = function(prodShiftOrder)
{
  var workerCount = this.countWorkers(prodShiftOrder);

  if (workerCount === null)
  {
    return;
  }

  if (workerCount.match > 0 && prodShiftOrder.notes)
  {
    this.results.notes.count += 1;
    this.results.notes.worksheets[prodShiftOrder.pressWorksheet] = true;
    this.results.notes.orders.push(prodShiftOrder._id);
  }

  this.handleEffAndProd(prodShiftOrder, workerCount);

  if (workerCount.match)
  {
    this.handleOrderWorkTimes(prodShiftOrder, workerCount.ratio);
  }
};

Report4.prototype.handleProdDowntime = function(prodDowntime)
{
  var workerCount = this.countWorkers(prodDowntime);

  if (workerCount === null)
  {
    return;
  }

  var match = workerCount.match > 0;
  var machine = prodDowntime.prodLine;
  var duration = (prodDowntime.finishedAt.getTime() - prodDowntime.startedAt.getTime()) / 3600000;
  var reason = prodDowntime.reason;
  var downtimeType = this.options.downtimeReasons[reason];

  if (downtimeType === 'adjusting')
  {
    this.addAdjustingDuration(this.machineAdjustingDurations, machine, duration);

    if (match)
    {
      this.addAdjustingDuration(this.operatorAdjustingDurations, machine, duration);
    }
  }
  else if (downtimeType === 'otherWorks')
  {
    if (match)
    {
      this.results.workTimes.otherWorks += duration;
    }
  }

  if (match)
  {
    var downtimes = this.results.workTimes.downtimes;

    if (downtimes[reason] === undefined)
    {
      downtimes[reason] = duration;
    }
    else
    {
      downtimes[reason] += duration;
    }
  }
};

Report4.prototype.addAdjustingDuration = function(allAdjustingDurations, machine, duration)
{
  if (allAdjustingDurations[machine] === undefined)
  {
    allAdjustingDurations[machine] = [duration];
  }
  else
  {
    allAdjustingDurations[machine].push(duration);
  }
};

Report4.prototype.countWorkers = function(prodShiftOrder)
{
  if (!Array.isArray(prodShiftOrder.operators) || !prodShiftOrder.operators.length)
  {
    return null;
  }

  var operatorCount = prodShiftOrder.operators.length;
  var workerCount = {
    total: operatorCount,
    match: 0,
    ratio: 0,
    operators: null
  };

  if (this.options.mode === 'shift')
  {
    if (prodShiftOrder.shift === this.options.shift)
    {
      workerCount.match = operatorCount;
      workerCount.operators = prodShiftOrder.operators.map(function(userInfo)
      {
        return userInfo.id;
      });
    }
  }
  else if (this.options.mode === 'masters')
  {
    if (prodShiftOrder.master && this.users[prodShiftOrder.master.id])
    {
      workerCount.match = operatorCount;
      workerCount.operators = prodShiftOrder.operators.map(function(userInfo)
      {
        return userInfo.id;
      });
    }
  }
  else if (this.options.mode === 'operators')
  {
    workerCount.operators = [];

    for (var i = 0; i < operatorCount; ++i)
    {
      var operator = prodShiftOrder.operators[i];

      if (operator && this.users[operator.id])
      {
        workerCount.match += 1;
        workerCount.operators.push(operator.id);
      }
    }
  }

  workerCount.ratio = workerCount.match / workerCount.total;

  return workerCount;
};

Report4.prototype.handleEffAndProd = function(prodShiftOrder, workerCount)
{
  var groupKey = util.createGroupKey(this.options.interval, prodShiftOrder.startedAt);
  var groupData = this.effAndProd[groupKey];

  if (groupData === undefined)
  {
    groupData = this.effAndProd[groupKey] = {
      effNum: 0,
      effDen: 0,
      prodDen: {},
      shifts: {},
      byDivision: {}
    };
  }

  var byDivision = groupData.byDivision[prodShiftOrder.division];

  if (byDivision === undefined)
  {
    byDivision = groupData.byDivision[prodShiftOrder.division] = {
      effNum: 0,
      effDen: 0
    };
  }

  var totalQuantity = prodShiftOrder.quantityDone + prodShiftOrder.quantityLost;

  if (workerCount.match)
  {
    groupData.effNum +=
      prodShiftOrder.laborTime / 100 * (totalQuantity * workerCount.ratio);
    groupData.effDen += prodShiftOrder.workDuration * workerCount.match;

    for (var i = 0, l = workerCount.operators.length; i < l; ++i)
    {
      groupData.prodDen[workerCount.operators[i]] = true;
    }

    groupData.shifts[prodShiftOrder.date.getTime()] = true;
  }

  byDivision.effNum = prodShiftOrder.laborTime / 100 * totalQuantity;
  byDivision.effDen = prodShiftOrder.workDuration * prodShiftOrder.operators.length;
};

Report4.prototype.handleOrderWorkTimes = function(prodShiftOrder, ratio)
{
  this.results.workTimes.total += prodShiftOrder.workDuration;

  this.getMachineTimes(prodShiftOrder.prodLine).work += prodShiftOrder.workDuration;

  this.results.quantities.good += prodShiftOrder.quantityDone * ratio;
  this.results.quantities.bad += prodShiftOrder.quantityLost * ratio;

  this.handleLosses(prodShiftOrder.losses, ratio);
};

Report4.prototype.handleLosses = function(losses, ratio)
{
  if (!Array.isArray(losses) || losses.length === 0)
  {
    return;
  }

  var lossReasons = this.lossReasons;
  var quantities = this.results.quantities;

  for (var i = 0, l = losses.length; i < l; ++i)
  {
    var loss = losses[i];

    if (!loss)
    {
      continue;
    }

    if (quantities.losses[loss.reason] === undefined)
    {
      lossReasons[loss.reason] = loss.label;
      quantities.losses[loss.reason] = loss.count * ratio;
    }
    else
    {
      quantities.losses[loss.reason] += loss.count * ratio;
    }
  }
};

Report4.prototype.getMachineTimes = function(machine)
{
  if (this.results.machineTimes[machine] === undefined)
  {
    this.results.machineTimes[machine] = {
      work: 0,
      operatorAdjustingMedian: 0,
      machineAdjustingMedian: 0
    };
  }

  return this.results.machineTimes[machine];
};
