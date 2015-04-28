// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('./util');
var calcFte = require('./calcFte');

module.exports = function report5(mongoose, options, done)
{
  /*jshint validthis:true*/

  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var FteMasterEntry = mongoose.model('FteMasterEntry');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var fromDate = moment(options.fromTime).hours(6).toDate();
  var toDate = moment(options.toTime).hours(6).toDate();

  var prodFlowMap = {};

  _.forEach(options.prodFlows || [], function(prodFlowId)
  {
    prodFlowMap[prodFlowId] = true;
  });

  var results = {
    options: options,
    days: {},
    data: {},
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
    calcFteStep,
    countFteAndFindQtyStep,
    countQuantityDoneStep,
    calcEfficiencyStep,
    calcMetricsStep,
    fillAndSortDataStep,
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

  function calcFteStep()
  {
    calcFte(mongoose, options, this.parallel());
  }

  function countFteAndFindQtyStep(err, fteResults)
  {
    if (err)
    {
      return this.skip(err);
    }

    this.fteResults = fteResults;

    findQuantityDone(this.parallel());
    countFteMasterEntries(fteResults.ratios, this.parallel());
    countFteLeaderEntries(fteResults.ratios, this.parallel());
  }

  function countQuantityDoneStep(err, qtyResults)
  {
    if (err)
    {
      return this.skip(err);
    }

    _.forEach(qtyResults, function(qtyResult)
    {
      if (qtyResult.qty > 0)
      {
        getDataEntry(qtyResult._id).qty += qtyResult.qty;
      }
    });

    var daysInGroups = {};

    _.forEach(results.days, function(days, groupKey)
    {
      daysInGroups[groupKey] = Object.keys(days).length;
    });

    results.days = daysInGroups;

    setImmediate(this.next());
  }

  function calcEfficiencyStep()
  {
    var $match = {
      startedAt: {$gte: fromDate, $lt: toDate},
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
      [
        {$match: $match},
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
        }}
      ],
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
    var dirIndir = results.dirIndir;
    var effIneff = results.effIneff;
    var fteResults = this.fteResults;

    dirIndir.storage = util.round(fteResults.totals.leader);

    effIneff.dirIndir = dirIndir.indirectProdFlow + dirIndir.storage;
    effIneff.efficiency = util.round(doc.eff);
    effIneff.value = util.round((dirIndir.direct * doc.eff) - dirIndir.direct);

    dirIndir.productivity = util.round(doc.num / options.prodNumConstant / fteResults.totals.prodDenTotal);
    dirIndir.productivityNoWh = util.round(doc.num / options.prodNumConstant / fteResults.totals.prodDenMaster);
    dirIndir.quantityDone = doc.qty;
    dirIndir.efficiencyNum = util.round(doc.num);
    dirIndir.laborSetupTime = util.round(doc.lst);

    this.fteResults = null;
  }

  function fillAndSortDataStep()
  {
    var sortedData = [];
    var createNextGroupKey = util.createCreateNextGroupKey(options.interval);
    var lastGroupKey = null;
    var groupKeys = Object.keys(results.data).sort(function(a, b) { return a - b; });
    var lastGroupIndex = groupKeys.length - 1;
    var toTime = Math.min(options.toTime, Date.now());

    _.forEach(groupKeys, function(key, i)
    {
      var data = results.data[key];

      while (lastGroupKey !== null && lastGroupKey < data.key)
      {
        lastGroupKey = createNextGroupKey(lastGroupKey);

        if (lastGroupKey === data.key)
        {
          break;
        }

        sortedData.push(lastGroupKey);
      }

      sortedData.push(data);

      lastGroupKey = data.key;

      if (i === lastGroupIndex)
      {
        lastGroupKey = createNextGroupKey(lastGroupKey);

        while (lastGroupKey < toTime)
        {
          sortedData.push(lastGroupKey);

          lastGroupKey = createNextGroupKey(lastGroupKey);
        }
      }
    });

    results.data = sortedData;

    setImmediate(this.next());
  }

  function countFteMasterEntries(fteRatios, done)
  {
    var conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      },
      total: {$gt: 0}
    };

    if (Array.isArray(options.subdivisions) && options.subdivisions.length)
    {
      conditions.subdivision = {$in: options.subdivisions};
    }

    var fields = {
      _id: 0,
      date: 1,
      tasks: 1
    };

    var stream = FteMasterEntry
      .find(conditions, fields)
      .sort({date: 1})
      .lean()
      .stream();

    stream.on('error', done);
    stream.on('close', done);
    stream.on('data', handleFteMasterEntry.bind(null, fteRatios));
  }

  function countFteLeaderEntries(fteRatios, done)
  {
    var subdivisionMap;

    if (Array.isArray(options.subdivisions))
    {
      subdivisionMap = {};

      _.forEach(options.subdivisions, function(subdivisionId)
      {
        subdivisionMap[subdivisionId] = true;
      });
    }
    else
    {
      subdivisionMap = null;
    }

    var conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      },
      'totals.overall': {$gt: 0}
    };

    var fields = {
      _id: 0,
      subdivision: 1,
      date: 1,
      tasks: 1
    };

    var stream = FteLeaderEntry
      .find(conditions, fields)
      .sort({date: 1})
      .lean()
      .stream();

    stream.on('error', done);
    stream.on('close', done);
    stream.on('data', handleFteLeaderEntry.bind(null, subdivisionMap, fteRatios));
  }

  function findQuantityDone(done)
  {
    var $match = {
      startedAt: {$gte: fromDate, $lt: toDate},
      workCenter: {$not: /^SPARE/},
      mechOrder: false,
      quantityDone: {$gt: 0}
    };

    if (options.orgUnitType)
    {
      $match[options.orgUnitType] = prepareOrgUnitId(options.orgUnitType, options.orgUnitId);
    }

    var $sum = options.weekends ? '$quantityDone' : {
      $cond: [
        {
          $or: [
            {$eq: [{$dayOfWeek: '$date'}, 1]},
            {$eq: [{$dayOfWeek: '$date'}, 7]}
          ]
        },
        0,
        '$quantityDone'
      ]
    };

    ProdShiftOrder.aggregate(
      {$match: $match},
      {$group: {
        _id: {date: '$date', order: '$orderId', operation: '$operationNo'},
        qty: {$sum: $sum}
      }},
      {$group: {
        _id: {date: '$_id.date', order: '$_id.order'},
        qty: {$max: '$qty'}
      }},
      {$group: {
        _id: '$_id.date',
        qty: {$sum: '$qty'}
      }},
      done
    );
  }

  function handleFteMasterEntry(fteRatios, fteMasterEntry)
  {
    var dataEntry = getDataEntry(fteMasterEntry.date);

    if (dataEntry === null)
    {
      return;
    }

    var ratios = fteRatios[fteMasterEntry.date.getTime()];

    if (!ratios || ratios.flows === -1)
    {
      ratios = {
        flows: 1,
        tasks: 1
      };
    }

    var tasks = fteMasterEntry.tasks;

    for (var i = 0, l = tasks.length; i < l; ++i)
    {
      var task = tasks[i];
      var isProdFlow = task.type === 'prodFlow';
      var prodFunctions = task.functions;
      var ratio = isProdFlow ? ratios.flows : ratios.tasks;

      for (var ii = 0, ll = prodFunctions.length; ii < ll; ++ii)
      {
        var prodFunction = prodFunctions[ii];
        var dirIndirRatio = options.directProdFunctions[prodFunction.id];
        var directRatio = dirIndirRatio / 100;
        var companies = prodFunction.companies;

        for (var iii = 0, lll = companies.length; iii < lll; ++iii)
        {
          var company = companies[iii];
          var count = company.count;

          if (count <= 0)
          {
            continue;
          }

          addToEntrysDirIndir(dataEntry, isProdFlow, directRatio, prodFunction.id, company.id, count);

          if (isProdFlow && options.prodFlows !== null && !prodFlowMap[task.id])
          {
            continue;
          }

          countTotalDirIndir(task, prodFunction, isProdFlow, dirIndirRatio, count * ratio);
        }
      }
    }
  }

  function addToEntrysDirIndir(dataEntry, isProdFlow, directRatio, prodFunctionId, companyId, count)
  {
    if (dataEntry.dni[prodFunctionId] === undefined)
    {
      dataEntry.dni[prodFunctionId] = {};
    }

    if (dataEntry.dni[prodFunctionId][companyId] === undefined)
    {
      dataEntry.dni[prodFunctionId][companyId] = [0, 0];
    }

    var dirIndir = dataEntry.dni[prodFunctionId][companyId];

    if (isProdFlow && directRatio > 0)
    {
      dirIndir[0] += count * directRatio;

      var indirectRatio = 1 - directRatio;

      if (indirectRatio > 0)
      {
        dirIndir[1] += count * indirectRatio;
      }
    }
    else
    {
      dirIndir[1] += count;
    }
  }

  function countTotalDirIndir(task, func, isProdFlow, dirIndirRatio, count)
  {
    results.dirIndir.production += count;

    addToGlobalDirIndir(results.dirIndir, isProdFlow, dirIndirRatio, func.id, count);

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

  function addToGlobalDirIndir(dirIndir, isProdFlow, dirIndirRatio, funcId, count)
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
        addToGlobalIndir(dirIndir, true, funcId, count * indirRatio);
      }
    }
    else
    {
      addToGlobalIndir(dirIndir, isProdFlow, funcId, count);
    }
  }

  function addToGlobalIndir(dirIndir, isProdFlow, funcId, count)
  {
    dirIndir.indirect += count;

    addToProperty(dirIndir.indirectByProdFunction, funcId, count);

    if (isProdFlow)
    {
      dirIndir.indirectProdFlow += count;
    }
  }

  function handleFteLeaderEntry(subdivisionMap, fteRatios, fteLeaderEntry)
  {
    var dataEntry = getDataEntry(fteLeaderEntry.date);

    if (dataEntry === null)
    {
      return;
    }

    var ratios = fteRatios[fteLeaderEntry.date.getTime()];

    if (!ratios || ratios.undivided === -1)
    {
      ratios = {
        undivided: 1,
        divided: 1
      };
    }

    var tasks = fteLeaderEntry.tasks;
    var matchingSubdivision = subdivisionMap === null || subdivisionMap[fteLeaderEntry.subdivision] === true;

    for (var i = 0, l = tasks.length; i < l; ++i)
    {
      var task = tasks[i];

      if (task.childCount > 0)
      {
        continue;
      }

      if (options.prodTasks[task.id] === undefined)
      {
        options.prodTasks[task.id] = {
          label: task.name,
          color: '#eeee00'
        };
      }

      if (Array.isArray(task.functions) && task.functions.length)
      {
        for (var ii = 0, ll = task.functions.length; ii < ll; ++ii)
        {
          var taskFunction = task.functions[ii];

          if (matchingSubdivision)
          {
            countCompanyDirIndir(dataEntry, taskFunction.companies, task.functions[ii].id);
          }

          countStorageByProdTasks(options.division, task, taskFunction.companies, ratios);
        }
      }
      else
      {
        if (matchingSubdivision)
        {
          countCompanyDirIndir(dataEntry, task.companies, 'wh');
        }

        countStorageByProdTasks(options.division, task, task.companies, ratios);
      }
    }
  }

  function countCompanyDirIndir(dataEntry, companies, prodFunctionId)
  {
    for (var i = 0, l = companies.length; i < l; ++i)
    {
      var company = companies[i];
      var count = company.count;

      if (Array.isArray(count))
      {
        count = 0;

        for (var ii = 0, ll = company.count.length; ii < ll; ++ii)
        {
          count += company.count[ii].value;
        }
      }

      if (count !== 0)
      {
        addToEntrysDirIndir(dataEntry, false, 0, prodFunctionId, company.id, count);
      }
    }
  }

  function countStorageByProdTasks(division, task, taskCompanies, ratios)
  {
    for (var i = 0, l = taskCompanies.length; i < l; ++i)
    {
      var company = taskCompanies[i];
      var divided = Array.isArray(company.count);
      var count = divided ? getDivisionCount(division, company.count) : company.count;

      addToProperty(
        results.dirIndir.storageByProdTasks,
        task.id,
        count * ratios[divided ? 'divided' : 'undivided']
      );
    }
  }

  function getDataEntry(date)
  {
    var time = date.getTime();
    var dayMoment = moment(time).hours(0);
    var weekDay = dayMoment.day();

    if (!options.weekends && (weekDay === 0 || weekDay === 6))
    {
      return null;
    }

    if (options.interval !== 'shift')
    {
      var dayTime = dayMoment.valueOf();

      time = dayMoment.startOf(options.interval).valueOf();

      increaseDayCount(time, dayTime);
    }

    var key = time + '';

    if (results.data[key] === undefined)
    {
      results.data[key] = createDefaultDataEntry(time);
    }

    return results.data[key];
  }

  function createDefaultDataEntry(key)
  {
    return {
      key: key,
      qty: 0,
      dni: {}
    };
  }

  function increaseDayCount(key, dayTime)
  {
    if (results.days[key] === undefined)
    {
      results.days[key] = {};
    }

    results.days[key][dayTime] = true;
  }

  function prepareOrgUnitId(orgUnitType, orgUnitId)
  {
    return orgUnitType !== 'subdivision' && orgUnitType !== 'prodFlow' ? orgUnitId : new ObjectId(orgUnitId);
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

    var divisionCount = _.find(divisionsCount, function(divisionCount)
    {
      return divisionCount.division === division;
    });

    return divisionCount ? divisionCount.value : 0;
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
};
