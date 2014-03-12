'use strict';

var step = require('h5.step');
var lodash = require('lodash');
var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('./util');

module.exports = function(mongoose, options, done)
{
  /*jshint validthis:true*/

  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ClipOrderCount = mongoose.model('ClipOrderCount');
  var FteMasterEntry = mongoose.model('FteMasterEntry');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var prodFlowMap = {};

  (options.prodFlows || []).forEach(function(prodFlowId)
  {
    prodFlowMap[prodFlowId] = true;
  });

  var results = {
    options: options,
    clip: [],
    dirIndir: {
      quantityDone: 0,
      productivity: 0,
      direct: 0,
      indirect: 0,
      indirectProdFlow: 0,
      directByProdFunction: {},
      indirectByProdFunction: {},
      production: 0,
      totalStorage: 0,
      storage: 0,
      storageByProdTasks: {}
    },
    effIneff: {
      value: 0,
      efficiency: 0,
      dirIndir: 0,
      prodTasks: {}
    }
  };

  step(
    countOrdersStep,
    groupOrderCountResultsStep,
    calcClipStep,
    findFteEntriesStep,
    roundValuesStep,
    calcEfficiencyStep,
    calcMetricsStep,
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

  function countOrdersStep()
  {
    if (options.interval === 'shift' || !options.mrpControllers.length)
    {
      return;
    }

    var conditions = {
      date: {$gte: new Date(options.fromTime), $lt: new Date(options.toTime)},
      mrp: {$in: options.mrpControllers}
    };
    var groupOperator = getGroupOperator(options.interval);

    ClipOrderCount.aggregate(
      {$match: conditions},
      {$group: {
        _id: groupOperator,
        all: {$sum: '$all'},
        cnf: {$sum: '$cnf'},
        dlv: {$sum: '$dlv'}
      }},
      {$sort: {_id: 1}},
      this.next()
    );
  }

  function groupOrderCountResultsStep(err, results)
  {
    if (err)
    {
      return this.done(done, err);
    }

    if (!results)
    {
      return;
    }

    var totalMap = {};
    var productionMap = {};
    var endToEndMap = {};
    var from = options.toTime;
    var to = options.fromTime;
    var i;
    var l;
    var startTime;

    for (i = 0, l = results.length; i < l; ++i)
    {
      var result = results[i];

      startTime = getStartTimeFromGroupKey(options.interval, result._id);

      if (startTime < from)
      {
        from = startTime;
      }

      if (startTime > to)
      {
        to = startTime;
      }

      totalMap[startTime] = result.all;
      productionMap[startTime] = result.cnf;
      endToEndMap[startTime] = result.dlv;
    }

    this.fromGroupKey = from;
    this.toGroupKey = to;
    this.totalMap = totalMap;
    this.productionMap = productionMap;
    this.endToEndMap = endToEndMap;

    setImmediate(this.next());
  }

  function calcClipStep()
  {
    var createNextGroupKey = util.createCreateNextGroupKey(options.interval);

    while (this.fromGroupKey <= this.toGroupKey)
    {
      var groupKey = this.fromGroupKey.toString();
      var orderCount = this.totalMap[groupKey];
      var production = this.productionMap[groupKey] / orderCount;
      var endToEnd = this.endToEndMap[groupKey] / orderCount;
      var day = new Date(this.fromGroupKey).getDay();

      if (options.interval !== 'day' || (day !== 0 && day !== 6))
      {
        results.clip.push({
          key: this.fromGroupKey,
          orderCount: orderCount,
          production: isNaN(production) ? undefined : util.round(production),
          endToEnd: isNaN(endToEnd) ? undefined : util.round(endToEnd)
        });
      }

      this.fromGroupKey = createNextGroupKey(this.fromGroupKey);
    }

    this.fromGroupKey = null;
    this.toGroupKey = null;
    this.totalMap = null;
    this.productionMap = null;
    this.endToEndMap = null;

    setImmediate(this.next());
  }

  function findFteEntriesStep()
  {
    this.from = new Date(options.fromTime);
    this.from.setHours(6);
    this.to = new Date(options.toTime);
    this.to.setHours(6);

    var masterConditions = {
      date: {$gte: this.from, $lt: this.to}
    };

    if (options.subdivisions.length)
    {
      masterConditions.subdivision = {$in: options.subdivisions};
    }

    masterConditions.total = {$gt: 0};

    var fteMasterEntryStream = FteMasterEntry
      .find(masterConditions, {_id: 0, date: 1, tasks: 1})
      .lean()
      .stream();

    handleFteMasterEntryStream(
      prodFlowMap, options, results, fteMasterEntryStream, this.parallel()
    );

    var leaderConditions = {
      date: {$gte: this.from, $lt: this.to},
      'totals.overall': {$gt: 0}
    };

    var fteLeaderEntryStream = FteLeaderEntry
      .find(leaderConditions, {_id: 0, date: 1, totals: 1, tasks: 1})
      .lean()
      .stream();

    handleFteLeaderEntryStream(options, results, fteLeaderEntryStream, this.parallel());
  }

  function roundValuesStep(err)
  {
    if (err)
    {
      return this.done(done, err);
    }

    roundObjectValues(results.dirIndir);
    roundObjectValues(results.effIneff);

    setImmediate(this.next());
  }

  function calcEfficiencyStep()
  {
    var $match = {
      startedAt: {$gte: this.from, $lt: this.to},
      laborTime: {$gt: 0},
      workerCount: {$gt: 0},
      workDuration: {$gt: 0}
    };

    if (options.orgUnitType)
    {
      $match[options.orgUnitType] = prepareOrgUnitId(options.orgUnitType, options.orgUnitId);
    }

    ProdShiftOrder.aggregate(
      [{$match: $match},
      {$project: {
        _id: 0,
        num: {$multiply: [{$divide: ['$laborTime', 100]}, '$quantityDone']},
        den: {$multiply: ['$workDuration', '$workerCount']},
        quantityDone: 1,
        mechOrder: 1
      }},
      {$group: {
        _id: null,
        num: {$sum: '$num'},
        den: {$sum: '$den'},
        qty: {$sum: {$cond: ['$mechOrder', 0, '$quantityDone']}}
      }},
      {$project: {
        num: '$num',
        den: '$den',
        eff: {$divide: ['$num', '$den']},
        qty: '$qty'
      }}],
      this.next()
    );
  }

  function calcMetricsStep(err, docs)
  {
    if (err)
    {
      return this.done(done, err);
    }

    var doc = docs.length === 1 ? docs[0] : {
      num: 0,
      eff: 0,
      qty: 0
    };

    results.effIneff.dirIndir = results.dirIndir.indirectProdFlow + results.dirIndir.storage;
    results.effIneff.efficiency = util.round(doc.eff);
    results.effIneff.value = util.round(
      (results.dirIndir.direct * doc.eff) - results.dirIndir.direct
    );

    var prodNum = doc.num / 8;
    var prodDen =
      results.dirIndir.production + (results.dirIndir.totalStorage / options.prodDivisionCount);

    results.dirIndir.productivity = util.round(prodNum / prodDen);
    results.dirIndir.quantityDone = doc.qty;
  }
};

function roundObjectValues(obj)
{
  Object.keys(obj).forEach(function(key)
  {
    if (typeof obj[key] === 'object')
    {
      roundObjectValues(obj[key]);
    }
    else
    {
      obj[key] = util.round(obj[key]);
    }
  });
}

function handleFteMasterEntryStream(prodFlowMap, options, results, stream, done)
{
  stream.on('error', done);

  stream.on('close', function()
  {
    done(null);
  });

  stream.on('data', function(fteMasterEntry)
  {
    for (var taskI = 0, taskL = fteMasterEntry.tasks.length; taskI < taskL; ++taskI)
    {
      var task = fteMasterEntry.tasks[taskI];
      var isProdFlow = task.type === 'prodFlow';

      for (var funcI = 0, funcL = task.functions.length; funcI < funcL; ++funcI)
      {
        var func = task.functions[funcI];
        var isDirect = options.directProdFunctions[func.id];

        for (var compI = 0, compL = func.companies.length; compI < compL; ++compI)
        {
          var count = func.companies[compI].count;

          results.dirIndir.production += count;

          if (isProdFlow && options.prodFlows !== null && !prodFlowMap[task.id])
          {
            continue;
          }

          addToDirIndir(results.dirIndir, isProdFlow, isDirect, func.id, count);

          if (!isProdFlow)
          {
            addToProperty(results.effIneff.prodTasks, task.id, count);
          }

          if (options.prodTasks[task.id] === undefined)
          {
            options.prodTasks[task.id] = {
              label: task.name,
              color: '#eeee00'
            };
          }
        }
      }
    }
  });
}

function addToDirIndir(dirIndir, isProdFlow, isDirect, funcId, count)
{
  if (isProdFlow && isDirect)
  {
    dirIndir.direct += count;

    addToProperty(dirIndir.directByProdFunction, funcId, count);
  }
  else
  {
    dirIndir.indirect += count;

    addToProperty(dirIndir.indirectByProdFunction, funcId, count);

    if (isProdFlow)
    {
      dirIndir.indirectProdFlow += count;
    }
  }
}

function handleFteLeaderEntryStream(options, results, stream, done)
{
  stream.on('error', done);

  stream.on('close', done);

  stream.on('data', function(fteLeaderEntry)
  {
    for (var taskI = 0, taskL = fteLeaderEntry.tasks.length; taskI < taskL; ++taskI)
    {
      var task = fteLeaderEntry.tasks[taskI];

      for (var compI = 0, compL = task.companies.length; compI < compL; ++compI)
      {
        var comp = task.companies[compI];
        var count = Array.isArray(comp.count)
          ? getDivisionCount(options.division, comp.count)
          : comp.count;
        var divisionCount = count;

        if (options.orgUnitType == null)
        {
          results.dirIndir.indirect += count;
          results.dirIndir.storage += count;
        }
        else
        {
          divisionCount /= Array.isArray(comp.count) ? 1 : options.prodDivisionCount;

          results.dirIndir.storage += divisionCount;
        }

        results.dirIndir.totalStorage += count;

        addToProperty(results.dirIndir.storageByProdTasks, task.id, divisionCount);

        if (options.prodTasks[task.id] === undefined)
        {
          options.prodTasks[task.id] = {
            label: task.name,
            color: '#eeee00'
          };
        }
      }
    }
  });
}

function getDivisionCount(division, divisionsCount)
{
  if (division === null)
  {
    return divisionsCount.reduce(
      function(total, divisionCount) { return total + divisionCount.value; },
      0
    );
  }

  var divisionCount = lodash.find(divisionsCount, function(divisionCount)
  {
    return divisionCount.division === division;
  });

  return divisionCount ? divisionCount.value : 0;
}

function getGroupOperator(interval)
{
  var operator = {};
  var addTzOffsetMs = [{$add: ['$date', '$tzOffsetMs']}];

  operator.y = {$year: addTzOffsetMs};

  if (interval === 'week')
  {
    operator.w = {$week: addTzOffsetMs};
  }
  else
  {
    operator.m = {$month: addTzOffsetMs};

    if (interval === 'day')
    {
      operator.d = {$dayOfMonth: addTzOffsetMs};
    }
  }

  return operator;
}

function getStartTimeFromGroupKey(interval, groupKey)
{
  var startTimeStr = groupKey.y + '-';

  if (interval === 'week')
  {
    startTimeStr += 'W' + util.pad0(groupKey.w + 1) + '-1';
  }
  else
  {
    startTimeStr += util.pad0(groupKey.m) + '-'
      + (interval === 'day' ? util.pad0(groupKey.d) : '01');
  }

  return moment(startTimeStr).valueOf();
}

function addToProperty(obj, prop, num)
{
  if (num === 0)
  {
    return;
  }

  if (obj[prop] === undefined)
  {
    obj[prop] = num;
  }
  else
  {
    obj[prop] += num;
  }
}

function prepareOrgUnitId(orgUnitType, orgUnitId)
{
  return orgUnitType !== 'subdivision' && orgUnitType !== 'prodFlow'
    ? orgUnitId
    : new ObjectId(orgUnitId);
}
