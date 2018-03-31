// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
const util = require('./util');
const calcFte = require('./calcFte');

module.exports = function report5(mongoose, options, done)
{
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const FteMasterEntry = mongoose.model('FteMasterEntry');
  const FteLeaderEntry = mongoose.model('FteLeaderEntry');

  const fromDate = moment(options.fromTime).hours(6).toDate();
  const toDate = moment(options.toTime).hours(6).toDate();

  const prodFlowMap = {};

  _.forEach(options.prodFlows || [], function(prodFlowId)
  {
    prodFlowMap[prodFlowId] = true;
  });

  const results = {
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
    },
    attendance: {}
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

    const daysInGroups = {};

    _.forEach(results.days, function(days, groupKey)
    {
      daysInGroups[groupKey] = Object.keys(days).length;
    });

    results.days = daysInGroups;

    setImmediate(this.next());
  }

  function calcEfficiencyStep()
  {
    const $match = {
      startedAt: {$gte: fromDate, $lt: toDate},
      laborTime: {$gt: 0},
      workerCount: {$gt: 0},
      workDuration: {$gt: 0}
    };

    if (options.orgUnitType)
    {
      const orgUnitProperty = options.orgUnitType === 'mrpController'
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

    const doc = docs.length === 1 ? docs[0] : {
      num: 0,
      eff: 0,
      qty: 0
    };
    const dirIndir = results.dirIndir;
    const effIneff = results.effIneff;
    const fteResults = this.fteResults;

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
    const sortedData = [];
    const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
    let lastGroupKey = null;
    const groupKeys = Object.keys(results.data).sort(function(a, b) { return a - b; });
    const lastGroupIndex = groupKeys.length - 1;
    const toTime = Math.min(options.toTime, Date.now());

    _.forEach(groupKeys, function(key, i)
    {
      const data = results.data[key];

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
    const conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      }
    };

    if (Array.isArray(options.subdivisions) && options.subdivisions.length)
    {
      conditions.subdivision = {$in: options.subdivisions};
    }

    const fields = {
      _id: 0,
      date: 1,
      tasks: 1,
      totals: 1
    };

    const stream = FteMasterEntry
      .find(conditions, fields)
      .sort({date: 1})
      .lean()
      .cursor();
    const complete = _.once(done);

    stream.on('error', complete);
    stream.on('end', complete);
    stream.on('data', handleFteMasterEntry.bind(null, fteRatios));
  }

  function countFteLeaderEntries(fteRatios, done)
  {
    let subdivisionMap = {};

    if (Array.isArray(options.subdivisions))
    {
      options.subdivisions.forEach(subdivisionId =>
      {
        subdivisionMap[subdivisionId] = true;
      });
    }
    else
    {
      subdivisionMap = null;
    }

    const conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      }
    };

    const fields = {
      _id: 0,
      subdivision: 1,
      date: 1,
      tasks: 1,
      totals: 1
    };

    const stream = FteLeaderEntry
      .find(conditions, fields)
      .sort({date: 1})
      .lean()
      .cursor();
    const complete = _.once(done);

    stream.on('error', complete);
    stream.on('end', complete);
    stream.on('data', handleFteLeaderEntry.bind(null, subdivisionMap, fteRatios));
  }

  function findQuantityDone(done)
  {
    const $match = {
      startedAt: {$gte: fromDate, $lt: toDate},
      workCenter: {$not: /^SPARE/},
      mechOrder: false,
      quantityDone: {$gt: 0}
    };

    if (options.orgUnitType)
    {
      $match[options.orgUnitType] = prepareOrgUnitId(options.orgUnitType, options.orgUnitId);
    }

    const $sum = options.weekends ? '$quantityDone' : {
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
      [
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
        }}
      ],
      done
    );
  }

  function handleFteMasterEntry(fteRatios, fteMasterEntry)
  {
    if (!fteMasterEntry.totals.supply.total)
    {
      return;
    }

    const dataEntry = getDataEntry(fteMasterEntry.date);

    if (dataEntry === null)
    {
      return;
    }

    let ratios = fteRatios[fteMasterEntry.date.getTime()];

    if (!ratios || ratios.flows === -1)
    {
      ratios = {
        flows: 1,
        tasks: 1
      };
    }

    const tasks = fteMasterEntry.tasks;

    for (let i = 0, l = tasks.length; i < l; ++i)
    {
      const task = tasks[i];
      const isProdFlow = task.type === 'prodFlow';
      const prodFunctions = task.functions;
      const ratio = isProdFlow ? ratios.flows : ratios.tasks;

      for (let ii = 0, ll = prodFunctions.length; ii < ll; ++ii)
      {
        const prodFunction = prodFunctions[ii];
        const dirIndirRatio = options.directProdFunctions[prodFunction.id];
        const directRatio = dirIndirRatio / 100;
        const companies = prodFunction.companies;

        for (let iii = 0, lll = companies.length; iii < lll; ++iii)
        {
          const company = companies[iii];
          const count = company.count;

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

    if (options.divisionType !== 'dist')
    {
      countAttendance(dataEntry, fteMasterEntry.totals);
    }
  }

  function countAttendance(dataEntry, totals)
  {
    if (!totals || !totals.demand.total)
    {
      return;
    }

    _.forEach(totals.demand, (count, companyId) =>
    {
      if (companyId === 'total')
      {
        return;
      }

      incAttendance(dataEntry, companyId, totals);
      incAttendance(results, companyId, totals);
    });
  }

  function incAttendance(obj, companyId, totals)
  {
    let attendance = obj.attendance[companyId];

    if (!attendance)
    {
      attendance = obj.attendance[companyId] = {
        demand: 0,
        supply: 0,
        shortage: 0,
        absence: 0
      };
    }

    attendance.demand += totals.demand[companyId];
    attendance.supply += totals.supply[companyId];
    attendance.shortage += totals.shortage[companyId];
    attendance.absence += totals.absence[companyId];
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

    const dirIndir = dataEntry.dni[prodFunctionId][companyId];

    if (isProdFlow && directRatio > 0)
    {
      dirIndir[0] += count * directRatio;

      const indirectRatio = 1 - directRatio;

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
      const dirRatio = dirIndirRatio / 100;
      const indirRatio = 1 - dirRatio;
      const dirCount = count * dirRatio;

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
    if (!fteLeaderEntry.totals.supply.total || options.subdivisionTypes[fteLeaderEntry.subdivision] === 'other')
    {
      return;
    }

    const dataEntry = getDataEntry(fteLeaderEntry.date);

    if (dataEntry === null)
    {
      return;
    }

    let ratios = fteRatios[fteLeaderEntry.date.getTime()];

    if (!ratios || ratios.undivided === -1)
    {
      ratios = {
        undivided: 1,
        divided: 1
      };
    }

    const tasks = fteLeaderEntry.tasks;
    const matchingSubdivision = subdivisionMap === null || subdivisionMap[fteLeaderEntry.subdivision] === true;

    for (let i = 0, l = tasks.length; i < l; ++i)
    {
      const task = tasks[i];

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
        for (let ii = 0, ll = task.functions.length; ii < ll; ++ii)
        {
          const taskFunction = task.functions[ii];

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

    if (options.divisionType !== 'prod' && matchingSubdivision)
    {
      countAttendance(dataEntry, fteLeaderEntry.totals);
    }
  }

  function countCompanyDirIndir(dataEntry, companies, prodFunctionId)
  {
    for (let i = 0, l = companies.length; i < l; ++i)
    {
      const company = companies[i];
      let count = company.count;

      if (Array.isArray(count))
      {
        count = 0;

        for (let ii = 0, ll = company.count.length; ii < ll; ++ii)
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
    for (let i = 0, l = taskCompanies.length; i < l; ++i)
    {
      const company = taskCompanies[i];
      const divided = Array.isArray(company.count);
      const count = divided ? getDivisionCount(division, company.count) : company.count;

      addToProperty(
        results.dirIndir.storageByProdTasks,
        task.id,
        count * ratios[divided ? 'divided' : 'undivided']
      );
    }
  }

  function getDataEntry(date)
  {
    let time = date.getTime();
    const dayMoment = moment(time).hours(0);
    const weekDay = dayMoment.day();

    if (!options.weekends && (weekDay === 0 || weekDay === 6))
    {
      return null;
    }

    if (options.interval !== 'shift')
    {
      const dayTime = dayMoment.valueOf();

      time = dayMoment.startOf(options.interval).valueOf();

      increaseDayCount(time, dayTime);
    }

    const key = time + '';

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
      dni: {},
      attendance: {

      }
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

    const divisionCount = _.find(divisionsCount, function(divisionCount)
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
