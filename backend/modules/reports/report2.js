// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var lodash = require('lodash');
var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('./util');
var calcFte = require('./calcFte');

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
      efficiencyNum: 0,
      laborSetupTime: 0,
      productivity: 0,
      productivityNoWh: 0,
      direct: 0,
      indirect: 0,
      indirectProdFlow: 0,
      directByProdFunction: {},
      indirectByProdFunction: {},
      production: 0,
      storage: 0,
      storageByProdTasks: {}
    },
    effIneff: {
      value: 0,
      efficiency: 0,
      dirIndir: 0,
      prodFlow: 0,
      prodTasks: {}
    }
  };

  step(
    countOrdersAndFteStep,
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

  function countOrdersAndFteStep()
  {
    calcFte(mongoose, options, this.parallel());

    if (options.interval === 'shift' || !Array.isArray(options.mrpControllers) || !options.mrpControllers.length)
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
      this.parallel()
    );
  }

  function groupOrderCountResultsStep(err, fteResults, clipResults)
  {
    if (err)
    {
      return this.done(done, err);
    }

    this.fteResults = fteResults;

    if (!clipResults)
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

    for (i = 0, l = clipResults.length; i < l; ++i)
    {
      var result = clipResults[i];

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

    if (Array.isArray(options.subdivisions) && options.subdivisions.length)
    {
      masterConditions.subdivision = {$in: options.subdivisions};
    }

    masterConditions.total = {$gt: 0};

    var fteMasterEntryStream = FteMasterEntry
      .find(masterConditions, {_id: 0, date: 1, tasks: 1})
      .lean()
      .stream();

    handleFteMasterEntryStream(
      prodFlowMap, options, this.fteResults.ratios, results, fteMasterEntryStream, this.parallel()
    );

    var leaderConditions = {
      date: {$gte: this.from, $lt: this.to},
      'totals.overall': {$gt: 0}
    };

    var fteLeaderEntryStream = FteLeaderEntry
      .find(leaderConditions, {_id: 0, date: 1, prodDivisionCount: 1, totals: 1, tasks: 1})
      .lean()
      .stream();

    handleFteLeaderEntryStream(
      options, this.fteResults.ratios, results, fteLeaderEntryStream, this.parallel()
    );
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
      var orgUnitProperty = options.orgUnitType === 'mrpController'
        ? 'mrpControllers'
        : options.orgUnitType;

      $match[orgUnitProperty] = prepareOrgUnitId(options.orgUnitType, options.orgUnitId);
    }

    ProdShiftOrder.aggregate(
      [{$match: $match},
      {$project: {
        _id: 0,
        num: {$multiply: [{$divide: ['$laborTime', 100]}, '$totalQuantity']},
        den: {$multiply: ['$workDuration', '$workerCount']},
        laborSetupTime: 1,
        quantityDone: 1,
        mechOrder: 1
      }},
      {$group: {
        _id: null,
        num: {$sum: '$num'},
        den: {$sum: '$den'},
        qty: {$sum: {$cond: ['$mechOrder', 0, '$quantityDone']}},
        lst: {$sum: '$laborSetupTime'}
      }},
      {$project: {
        num: '$num',
        den: '$den',
        eff: {$divide: ['$num', '$den']},
        qty: '$qty',
        lst: '$lst'
      }}],
      this.parallel()
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

    results.dirIndir.storage = util.round(this.fteResults.totals.leader);

    results.effIneff.dirIndir = results.dirIndir.indirectProdFlow + results.dirIndir.storage;
    results.effIneff.efficiency = util.round(doc.eff);
    results.effIneff.value = util.round((results.dirIndir.direct * doc.eff) - results.dirIndir.direct);

    results.dirIndir.productivity =
      util.round(doc.num / options.prodNumConstant / this.fteResults.totals.prodDenTotal);
    results.dirIndir.productivityNoWh =
      util.round(doc.num / options.prodNumConstant / this.fteResults.totals.prodDenMaster);
    results.dirIndir.quantityDone = doc.qty;
    results.dirIndir.efficiencyNum = util.round(doc.num);
    results.dirIndir.laborSetupTime = util.round(doc.lst);

    this.fteResults = null;
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

function handleFteMasterEntryStream(prodFlowMap, options, fteRatios, results, stream, done)
{
  stream.on('error', done);

  stream.on('close', function()
  {
    done(null);
  });

  stream.on('data', function(fteMasterEntry)
  {
    var ratios = fteRatios[fteMasterEntry.date.getTime()];

    if (!ratios || ratios.flows === -1)
    {
      ratios = {
        flows: 1,
        tasks: 1
      };
    }

    for (var taskI = 0, taskL = fteMasterEntry.tasks.length; taskI < taskL; ++taskI)
    {
      var task = fteMasterEntry.tasks[taskI];
      var isProdFlow = task.type === 'prodFlow';
      var ratio = isProdFlow ? ratios.flows : ratios.tasks;

      for (var funcI = 0, funcL = task.functions.length; funcI < funcL; ++funcI)
      {
        var func = task.functions[funcI];
        var dirIndirRatio = options.directProdFunctions[func.id];

        for (var compI = 0, compL = func.companies.length; compI < compL; ++compI)
        {
          var count = func.companies[compI].count * ratio;

          if (isProdFlow && options.prodFlows !== null && !prodFlowMap[task.id])
          {
            continue;
          }

          results.dirIndir.production += count;

          addToDirIndir(results.dirIndir, isProdFlow, dirIndirRatio, func.id, count);

          if (isProdFlow)
          {
            results.effIneff.prodFlow += count;
          }
          else
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

function addToDirIndir(dirIndir, isProdFlow, dirIndirRatio, funcId, count)
{
  if (isProdFlow && dirIndirRatio > 0)
  {
    var dirRatio = dirIndirRatio / 100;
    var indirRatio = 1 - dirRatio;
    var dirCount = count * dirRatio;

    dirIndir.direct += dirCount;

    addToProperty(dirIndir.directByProdFunction, funcId, dirCount);

    if (indirRatio > 0)
    {
      addToIndir(dirIndir, true, funcId, count * indirRatio);
    }
  }
  else
  {
    addToIndir(dirIndir, isProdFlow, funcId, count);
  }
}

function addToIndir(dirIndir, isProdFlow, funcId, count)
{
  dirIndir.indirect += count;

  addToProperty(dirIndir.indirectByProdFunction, funcId, count);

  if (isProdFlow)
  {
    dirIndir.indirectProdFlow += count;
  }
}

function handleFteLeaderEntryStream(options, fteRatios, results, stream, done)
{
  stream.on('error', done);

  stream.on('close', done);

  stream.on('data', function(fteLeaderEntry)
  {
    var ratios = fteRatios[fteLeaderEntry.date.getTime()];

    if (!ratios || ratios.undivided === -1)
    {
      ratios = {
        undivided: 1,
        divided: 1
      };
    }

    for (var taskI = 0, taskL = fteLeaderEntry.tasks.length; taskI < taskL; ++taskI)
    {
      var task = fteLeaderEntry.tasks[taskI];

      for (var companyI = 0, companyL = task.companies.length; companyI < companyL; ++companyI)
      {
        var company = task.companies[companyI];
        var divided = Array.isArray(company.count);
        var count = divided ? getDivisionCount(options.division, company.count) : company.count;

        addToProperty(
          results.dirIndir.storageByProdTasks,
          task.id,
          count * ratios[divided ? 'divided' : 'undivided']
        );

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
