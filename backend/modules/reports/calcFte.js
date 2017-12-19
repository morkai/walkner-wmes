// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('./util');

module.exports = function(mongoose, options, done)
{
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const FteMasterEntry = mongoose.model('FteMasterEntry');
  const FteLeaderEntry = mongoose.model('FteLeaderEntry');

  if (typeof options.division !== 'string')
  {
    options.division = null;
  }

  options.fromTime = +options.fromTime;
  options.toTime = +options.toTime;

  const ignoredProdTasks = {};

  if (options.prodTasks)
  {
    _.forEach(Object.keys(options.prodTasks), function(id)
    {
      if (options.prodTasks[id].inProd === false)
      {
        ignoredProdTasks[id] = true;
      }
    });
  }

  const results = {
    options: options,
    grouped: {},
    totals: {
      master: 0,
      leader: 0,
      total: 0,
      prodDenMaster: 0,
      prodDenLeader: 0,
      prodDenTotal: 0
    },
    ratios: {},
    byOrgUnit: {}
  };

  const byOrgUnit = _.isEmpty(options.byOrgUnit) ? [] : Object.keys(options.byOrgUnit);

  const from = new Date(options.fromTime);
  const to = new Date(options.toTime);

  step(
    function getActiveOrgUnitsStep()
    {
      const activeOrgUnitOptions = {
        from: from,
        to: to,
        orgUnitTypes: {},
        ignoredOrgUnits: options.ignoredOrgUnits
      };

      if (options.orgUnitType !== null && options.orgUnitType !== 'division')
      {
        activeOrgUnitOptions.orgUnitTypes.prodLine = true;
      }

      getActiveOrgUnits(activeOrgUnitOptions, this.next());
    },
    function handleGetActiveOrgUnitsResultStep(err, dateToActiveOrgUnits)
    {
      if (err)
      {
        return this.done(done, err);
      }

      this.dateToActiveOrgUnits = dateToActiveOrgUnits;

      setImmediate(this.next());
    },
    function handleFteEntriesStep()
    {
      const fteLeaderEntryStream = FteLeaderEntry
        .find(
          {date: {$gte: from, $lt: to}},
          {
            subdivision: 1,
            date: 1,
            'tasks.id': 1,
            'tasks.childCount': 1,
            'tasks.companies.count': 1,
            'tasks.functions.companies.count': 1
          }
        )
        .sort({date: 1})
        .lean()
        .cursor();

      handleFteLeaderEntryStream(options, this.dateToActiveOrgUnits, fteLeaderEntryStream, _.once(this.parallel()));

      const conditions = {
        date: {$gte: from, $lt: to}
      };

      if (Array.isArray(options.subdivisions))
      {
        conditions.subdivision = {$in: options.subdivisions};
      }

      const fteMasterEntryStream = FteMasterEntry
        .find(conditions, {
          subdivision: 1,
          date: 1,
          'tasks.id': 1,
          'tasks.type': 1,
          'tasks.noPlan': 1,
          'tasks.total': 1
        })
        .sort({date: 1})
        .lean()
        .cursor();

      handleFteMasterEntryStream(options, this.dateToActiveOrgUnits, fteMasterEntryStream, _.once(this.parallel()));
    },
    function groupResultsStep()
    {
      const interval = options.interval;

      groupResults(interval, results);

      byOrgUnit.forEach(orgUnitId => groupResults(interval, getResults(orgUnitId)));
    },
    function()
    {
      if (_.isEmpty(options.byOrgUnit))
      {
        done(null, results);
      }
      else
      {
        results.byOrgUnit[options.orgUnitId] = {
          grouped: results.grouped,
          totals: results.totals,
          ratios: results.ratios
        };

        done(null, {
          options: {
            fromTime: options.fromTime,
            toTime: options.toTime
          },
          byOrgUnit: results.byOrgUnit
        });
      }
    }
  );

  function groupResults(interval, results)
  {
    const grouped = {};
    const dates = Object.keys(results.grouped);

    for (let i = 0, l = dates.length; i < l; ++i)
    {
      let date = dates[i];
      const fte = results.grouped[date];

      fte.total = fte.leader + fte.master;
      fte.prodDenTotal = fte.prodDenLeader + fte.prodDenMaster;

      if (!fte.total)
      {
        continue;
      }

      if (interval === 'shift')
      {
        grouped[date] = fte;
      }
      else if (interval === 'hour')
      {
        for (let h = 0; h < 8; ++h)
        {
          date = +date + 3600 * 1000 * h;

          grouped[date] = {
            master: fte.master / 8,
            leader: fte.leader / 8,
            total: fte.total / 8,
            prodDenMaster: fte.prodDenMaster / 8,
            prodDenLeader: fte.prodDenLeader / 8,
            prodDenTotal: fte.prodDenTotal / 8
          };
        }
      }
      else
      {
        const groupKey = util.createGroupKey(interval, +date);

        if (grouped[groupKey] === undefined)
        {
          grouped[groupKey] = fte;
        }
        else
        {
          grouped[groupKey].master += fte.master;
          grouped[groupKey].leader += fte.leader;
          grouped[groupKey].total += fte.total;
          grouped[groupKey].prodDenMaster += fte.prodDenMaster;
          grouped[groupKey].prodDenLeader += fte.prodDenLeader;
          grouped[groupKey].prodDenTotal += fte.prodDenTotal;
        }
      }
    }

    results.grouped = grouped;
    results.totals.total = results.totals.master + results.totals.leader;
    results.totals.prodDenTotal = results.totals.prodDenMaster + results.totals.prodDenLeader;
  }

  function getResults(orgUnitId)
  {
    if (!orgUnitId)
    {
      return results;
    }

    if (!results.byOrgUnit[orgUnitId])
    {
      results.byOrgUnit[orgUnitId] = {
        grouped: {},
        totals: {
          master: 0,
          leader: 0,
          total: 0,
          prodDenMaster: 0,
          prodDenLeader: 0,
          prodDenTotal: 0
        },
        ratios: {}
      };
    }

    return results.byOrgUnit[orgUnitId];
  }

  function createDefaultGroupedResult(results, key)
  {
    if (!results.grouped[key])
    {
      results.grouped[key] = {
        master: 0,
        leader: 0,
        prodDenMaster: 0,
        prodDenLeader: 0
      };
    }
  }

  function createDefaultRatiosResult(results, key)
  {
    if (!results.ratios[key])
    {
      results.ratios[key] = {
        divided: -1,
        undivided: -1,
        flows: -1,
        tasks: -1
      };
    }
  }

  function getActiveOrgUnits(options, done)
  {
    const pipeline = [
      {
        $match: {
          startedAt: {
            $gte: options.from,
            $lt: options.to
          }
        }
      }
    ];

    const ignoredProdLines = options.ignoredOrgUnits ? Object.keys(options.ignoredOrgUnits.prodLine) : [];

    if (ignoredProdLines.length)
    {
      pipeline[0].$match.prodLine = {$nin: ignoredProdLines};
    }

    pipeline.push(
      {$group: {
        _id: '$date',
        division: {$addToSet: '$division'},
        prodLine: {$addToSet: '$prodLine'}
      }},
      {$sort: {_id: 1}}
    );

    ProdShiftOrder.aggregate(pipeline, function(err, results)
    {
      if (err)
      {
        return done(err);
      }

      const dateToActiveOrgUnits = {};

      for (let i = 0, l = results.length; i < l; ++i)
      {
        const result = results[i];

        dateToActiveOrgUnits[result._id.getTime()] = result;

        delete result._id;
      }

      return done(null, dateToActiveOrgUnits);
    });
  }

  function adjustToWorkingOrgUnitsInStorage(results, key, activeOrgUnits, options, fte)
  {
    if (options.orgUnitType === null)
    {
      return;
    }

    const ratios = results.ratios[key];

    if (ratios && ratios.divided !== -1)
    {
      fte.divided *= ratios.divided;
      fte.undivided *= ratios.undivided;
      fte.prodDenDivided *= ratios.divided;
      fte.prodDenUndivided *= ratios.undivided;

      return;
    }

    createDefaultRatiosResult(results, key);

    const allWorkingProdLines = activeOrgUnits ? activeOrgUnits.prodLine : [];
    const allProdLinesInOrgUnit = options.orgUnits.orgUnit;
    const allProdLinesInDivision = options.orgUnits[
      options.orgUnitType === 'division' ? 'orgUnit' : 'division'
    ];

    const workingProdLinesInOrgUnit = _.intersection(
      allProdLinesInOrgUnit,
      allWorkingProdLines
    );
    const allWorkingProdLinesInDivision = options.orgUnitType === 'division'
      ? workingProdLinesInOrgUnit
      : _.intersection(allProdLinesInDivision, allWorkingProdLines);

    const dividedRatio = allWorkingProdLinesInDivision.length
      ? (workingProdLinesInOrgUnit.length / allWorkingProdLinesInDivision.length)
      : 0;
    const undividedRatio = allWorkingProdLines.length
      ? (workingProdLinesInOrgUnit.length / allWorkingProdLines.length)
      : 0;

    fte.divided *= dividedRatio;
    fte.undivided *= undividedRatio;
    fte.prodDenDivided *= dividedRatio;
    fte.prodDenUndivided *= undividedRatio;

    results.ratios[key].divided = dividedRatio;
    results.ratios[key].undivided = undividedRatio;
  }

  function adjustToWorkingOrgUnitsInProduction(results, key, activeOrgUnits, options, fte)
  {
    createDefaultRatiosResult(results, key);

    const ratios = results.ratios[key];

    if (!activeOrgUnits
      || !Array.isArray(activeOrgUnits.prodLine)
      || !activeOrgUnits.prodLine.length)
    {
      ratios.flows = 0;
      ratios.tasks = 0;
    }

    if (ratios.flows !== -1)
    {
      fte.flows *= ratios.flows;
      fte.tasks *= ratios.tasks;
      fte.prodDenTasks *= ratios.tasks;

      return;
    }

    const allWorkingProdLines = activeOrgUnits.prodLine;
    const allProdLinesInSubdivision = options.orgUnits.subdivision;
    const allProdLinesInOrgUnit = options.orgUnits.orgUnit;
    const workingProdLinesInSubdivision = _.intersection(
      allProdLinesInSubdivision,
      allWorkingProdLines
    );
    const workingProdLinesInOrgUnit = _.intersection(
      workingProdLinesInSubdivision,
      allProdLinesInOrgUnit
    );

    let flowsRatio;
    let tasksRatio = workingProdLinesInOrgUnit.length / workingProdLinesInSubdivision.length;

    if (options.orgUnitType === 'mrpController' || options.orgUnitType === 'prodFlow')
    {
      flowsRatio = workingProdLinesInOrgUnit.length === 0 ? 0 : 1;
    }
    else
    {
      const allProdLinesInProdFlow = options.orgUnits.prodFlow;

      const workingProdLinesInProdFlow = _.intersection(
        allProdLinesInProdFlow,
        workingProdLinesInSubdivision
      );

      flowsRatio = workingProdLinesInOrgUnit.length / workingProdLinesInProdFlow.length;
    }

    if (isNaN(flowsRatio))
    {
      flowsRatio = 0;
    }

    if (isNaN(tasksRatio))
    {
      tasksRatio = 0;
    }

    fte.flows *= flowsRatio;
    fte.tasks *= tasksRatio;
    fte.prodDenTasks *= tasksRatio;

    results.ratios[key].flows = flowsRatio;
    results.ratios[key].tasks = tasksRatio;
  }

  function handleFteLeaderEntryStream(options, dateToActiveOrgUnits, fteLeaderEntryStream, done)
  {
    fteLeaderEntryStream.on('error', done);

    fteLeaderEntryStream.on('end', done);

    fteLeaderEntryStream.on('data', function(fteLeaderEntry)
    {
      if (options.subdivisionTypes[fteLeaderEntry.subdivision] === 'other')
      {
        return;
      }

      const key = '' + fteLeaderEntry.date.getTime();

      handleFteLeaderEntry(null, options, key, dateToActiveOrgUnits, fteLeaderEntry);

      byOrgUnit.forEach(orgUnitId =>
      {
        handleFteLeaderEntry(orgUnitId, options.byOrgUnit[orgUnitId], key, dateToActiveOrgUnits, fteLeaderEntry);
      });
    });
  }

  function handleFteLeaderEntry(orgUnitId, options, key, dateToActiveOrgUnits, fteLeaderEntry)
  {
    const results = getResults(orgUnitId);

    createDefaultGroupedResult(results, key);

    const activeOrgUnits = dateToActiveOrgUnits[key];
    const activeDivisionsCount = options.division === null
      ? 1
      : activeOrgUnits && activeOrgUnits.division.length
        ? activeOrgUnits.division.length
        : 0;

    if (activeDivisionsCount === 0)
    {
      return;
    }

    const fte = {
      divided: 0,
      undivided: 0,
      prodDenDivided: 0,
      prodDenUndivided: 0
    };

    for (let i = 0, l = fteLeaderEntry.tasks.length; i < l; ++i)
    {
      countFteLeaderEntryTaskFte(fteLeaderEntry.tasks[i], options.division, fte);
    }

    adjustToWorkingOrgUnitsInStorage(results, key, activeOrgUnits, options, fte);

    results.totals.leader += fte.divided + fte.undivided;
    results.totals.prodDenLeader += fte.prodDenDivided + fte.prodDenUndivided;
    results.grouped[key].leader += fte.divided + fte.undivided;
    results.grouped[key].prodDenLeader += fte.prodDenDivided + fte.prodDenUndivided;
  }

  function countFteLeaderEntryTaskFte(task, division, fte)
  {
    if (task.childCount > 0)
    {
      return;
    }

    if (Array.isArray(task.functions) && task.functions.length > 0)
    {
      countFteLeaderEntryTaskFunctionFte(task, division, fte);
    }
    else
    {
      countFteLeaderEntryTaskCompanyFte(task.companies, ignoredProdTasks[task.id] === undefined, division, fte);
    }
  }

  function countFteLeaderEntryTaskFunctionFte(task, division, fte)
  {
    const inProdProdTask = ignoredProdTasks[task.id] === undefined;
    const taskFunctions = task.functions;

    for (let i = 0, l = taskFunctions.length; i < l; ++i)
    {
      countFteLeaderEntryTaskCompanyFte(taskFunctions[i].companies, inProdProdTask, division, fte);
    }
  }

  function countFteLeaderEntryTaskCompanyFte(taskCompanies, inProdProdTask, division, fte)
  {
    for (let i = 0, l = taskCompanies.length; i < l; ++i)
    {
      const taskCompany = taskCompanies[i];

      if (typeof taskCompany.count === 'number')
      {
        fte.undivided += taskCompany.count;

        if (inProdProdTask)
        {
          fte.prodDenUndivided += taskCompany.count;
        }
      }
      else if (Array.isArray(taskCompany.count))
      {
        countDividedFte(taskCompany.count, division, inProdProdTask, fte);
      }
    }
  }

  function countDividedFte(count, division, inProdProdTask, fte)
  {
    for (let i = 0, l = count.length; i < l; ++i)
    {
      if (division === null || count[i].division === division)
      {
        fte.divided += count[i].value;

        if (inProdProdTask)
        {
          fte.prodDenDivided += count[i].value;
        }
      }
    }
  }

  function handleFteMasterEntryStream(options, dateToActiveOrgUnits, fteMasterEntryStream, done)
  {
    fteMasterEntryStream.on('error', done);

    fteMasterEntryStream.on('end', done);

    fteMasterEntryStream.on('data', function(fteMasterEntry)
    {
      if (util.isIgnoredOrgUnit(options, fteMasterEntry, 'subdivision'))
      {
        return;
      }

      const key = '' + fteMasterEntry.date.getTime();

      handleFteMasterEntry(null, options, key, dateToActiveOrgUnits, fteMasterEntry);

      byOrgUnit.forEach(orgUnitId =>
      {
        handleFteMasterEntry(orgUnitId, options.byOrgUnit[orgUnitId], key, dateToActiveOrgUnits, fteMasterEntry);
      });
    });
  }

  function handleFteMasterEntry(orgUnitId, options, key, dateToActiveOrgUnits, fteMasterEntry)
  {
    const results = getResults(orgUnitId);

    createDefaultGroupedResult(results, key);

    const fte = {
      flows: 0,
      tasks: 0,
      prodDenTasks: 0
    };

    for (let i = 0, l = fteMasterEntry.tasks.length; i < l; ++i)
    {
      countFteMasterEntryTaskFte(options, fteMasterEntry.tasks[i], fte);
    }

    if (options.orgUnitType
      && options.orgUnitType !== 'division'
      && options.orgUnitType !== 'subdivision')
    {
      adjustToWorkingOrgUnitsInProduction(results, key, dateToActiveOrgUnits[key], options, fte);
    }

    results.totals.master += fte.flows + fte.tasks;
    results.totals.prodDenMaster += fte.flows + fte.prodDenTasks;
    results.grouped[key].master += fte.flows + fte.tasks;
    results.grouped[key].prodDenMaster += fte.flows + fte.prodDenTasks;
  }

  function countFteMasterEntryTaskFte(options, task, fte)
  {
    const isProdFlow = task.type === 'prodFlow';

    if (task.noPlan || (isProdFlow && !containsProdFlow(options, task)))
    {
      return;
    }

    if (isProdFlow)
    {
      fte.flows += task.total;
    }
    else
    {
      fte.tasks += task.total;

      if (!ignoredProdTasks[task.id])
      {
        fte.prodDenTasks += task.total;
      }
    }
  }

  function containsProdFlow(options, task)
  {
    return !Array.isArray(options.prodFlows) || options.prodFlows.indexOf(task.id.toString()) !== -1;
  }
};
