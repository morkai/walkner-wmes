// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var util = require('./util');

module.exports = function(mongoose, options, done)
{
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var FteMasterEntry = mongoose.model('FteMasterEntry');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  if (typeof options.division !== 'string')
  {
    options.division = null;
  }

  options.fromTime = +options.fromTime;
  options.toTime = +options.toTime;

  var ignoredProdTasks = {};

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

  var results = {
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
    ratios: {}
  };

  var from = new Date(options.fromTime);
  var to = new Date(options.toTime);

  step(
    function getActiveOrgUnitsStep()
    {
      var activeOrgUnitOptions = {
        from: from,
        to: to,
        orgUnitTypes: {}
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
      var fteLeaderEntryStream = FteLeaderEntry
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
        .stream();

      handleFteLeaderEntryStream(
        options, this.dateToActiveOrgUnits, fteLeaderEntryStream, this.parallel()
      );

      var conditions = {
        date: {$gte: from, $lt: to}
      };

      if (Array.isArray(options.subdivisions))
      {
        conditions.subdivision = {$in: options.subdivisions};
      }

      var fteMasterEntryStream = FteMasterEntry
        .find(conditions, {
          date: 1,
          'tasks.id': 1,
          'tasks.type': 1,
          'tasks.noPlan': 1,
          'tasks.total': 1
        })
        .sort({date: 1})
        .lean()
        .stream();

      handleFteMasterEntryStream(
        options, this.dateToActiveOrgUnits, fteMasterEntryStream, this.parallel()
      );
    },
    function groupResultsStep()
    {
      var interval = options.interval;
      var grouped = {};
      var dates = Object.keys(results.grouped);

      for (var i = 0, l = dates.length; i < l; ++i)
      {
        var date = dates[i];
        var fte = results.grouped[date];

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
          for (var h = 0; h < 8; ++h)
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
          var groupKey = util.createGroupKey(interval, +date);

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
    },
    function()
    {
      done(null, results);
    }
  );

  function createDefaultGroupedResult(key)
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

  function createDefaultRatiosResult(key)
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
    var pipeline = [
      {$match: {startedAt: {$gte: options.from, $lt: options.to}}}
    ];

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

      var dateToActiveOrgUnits = {};

      for (var i = 0, l = results.length; i < l; ++i)
      {
        var result = results[i];

        dateToActiveOrgUnits[result._id.getTime()] = result;

        delete result._id;
      }

      return done(null, dateToActiveOrgUnits);
    });
  }

  function adjustToWorkingOrgUnitsInStorage(key, activeOrgUnits, options, fte)
  {
    if (options.orgUnitType === null)
    {
      return;
    }

    var ratios = results.ratios[key];

    if (ratios && ratios.divided !== -1)
    {
      fte.divided *= ratios.divided;
      fte.undivided *= ratios.undivided;
      fte.prodDenDivided *= ratios.divided;
      fte.prodDenUndivided *= ratios.undivided;

      return;
    }

    createDefaultRatiosResult(key);

    var allWorkingProdLines = activeOrgUnits.prodLine;
    var allProdLinesInOrgUnit = options.orgUnits.orgUnit;
    var allProdLinesInDivision = options.orgUnits[
      options.orgUnitType === 'division' ? 'orgUnit' : 'division'
    ];

    var workingProdLinesInOrgUnit = _.intersection(
      allProdLinesInOrgUnit,
      allWorkingProdLines
    );
    var allWorkingProdLinesInDivision = options.orgUnitType === 'division'
      ? workingProdLinesInOrgUnit
      : _.intersection(allProdLinesInDivision, allWorkingProdLines);

    var dividedRatio = allWorkingProdLinesInDivision.length
      ? (workingProdLinesInOrgUnit.length / allWorkingProdLinesInDivision.length)
      : 0;
    var undividedRatio = allWorkingProdLines.length
      ? (workingProdLinesInOrgUnit.length / allWorkingProdLines.length)
      : 0;

    fte.divided *= dividedRatio;
    fte.undivided *= undividedRatio;
    fte.prodDenDivided *= dividedRatio;
    fte.prodDenUndivided *= undividedRatio;

    results.ratios[key].divided = dividedRatio;
    results.ratios[key].undivided = undividedRatio;
  }

  function adjustToWorkingOrgUnitsInProduction(key, activeOrgUnits, options, fte)
  {
    createDefaultRatiosResult(key);

    var ratios = results.ratios[key];

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

    var allWorkingProdLines = activeOrgUnits.prodLine;

    var allProdLinesInSubdivision = options.orgUnits.subdivision;
    var allProdLinesInOrgUnit = options.orgUnits.orgUnit;

    var workingProdLinesInSubdivision = _.intersection(
      allProdLinesInSubdivision,
      allWorkingProdLines
    );
    var workingProdLinesInOrgUnit = _.intersection(
      workingProdLinesInSubdivision,
      allProdLinesInOrgUnit
    );

    var flowsRatio = 1;
    var tasksRatio = 1;

    if (options.orgUnitType === 'mrpController' || options.orgUnitType === 'prodFlow')
    {
      tasksRatio = workingProdLinesInOrgUnit.length / workingProdLinesInSubdivision.length;
    }
    else
    {
      var allProdLinesInProdFlow = options.orgUnits.prodFlow;

      var workingProdLinesInProdFlow = _.intersection(
        allProdLinesInProdFlow,
        workingProdLinesInSubdivision
      );

      flowsRatio = workingProdLinesInOrgUnit.length / workingProdLinesInProdFlow.length;
      tasksRatio = workingProdLinesInOrgUnit.length / workingProdLinesInSubdivision.length;
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

    fteLeaderEntryStream.on('close', done);

    fteLeaderEntryStream.on('data', function(fteLeaderEntry)
    {
      if (options.subdivisionTypes[fteLeaderEntry.subdivision] === 'other')
      {
        return;
      }

      var key = '' + fteLeaderEntry.date.getTime();

      createDefaultGroupedResult(key);

      var activeOrgUnits = dateToActiveOrgUnits[key];
      var activeDivisionsCount = options.division === null
        ? 1
        : activeOrgUnits && activeOrgUnits.division.length
          ? activeOrgUnits.division.length
          : 0;

      if (activeDivisionsCount === 0)
      {
        return;
      }

      var fte = {
        divided: 0,
        undivided: 0,
        prodDenDivided: 0,
        prodDenUndivided: 0
      };

      for (var i = 0, l = fteLeaderEntry.tasks.length; i < l; ++i)
      {
        countFteLeaderEntryTaskFte(fteLeaderEntry.tasks[i], options.division, fte);
      }

      adjustToWorkingOrgUnitsInStorage(key, activeOrgUnits, options, fte);

      results.totals.leader += fte.divided + fte.undivided;
      results.totals.prodDenLeader += fte.prodDenDivided + fte.prodDenUndivided;
      results.grouped[key].leader += fte.divided + fte.undivided;
      results.grouped[key].prodDenLeader += fte.prodDenDivided + fte.prodDenUndivided;
    });
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
    var inProdProdTask = ignoredProdTasks[task.id] === undefined;
    var taskFunctions = task.functions;

    for (var i = 0, l = taskFunctions.length; i < l; ++i)
    {
      countFteLeaderEntryTaskCompanyFte(taskFunctions[i].companies, inProdProdTask, division, fte);
    }
  }

  function countFteLeaderEntryTaskCompanyFte(taskCompanies, inProdProdTask, division, fte)
  {
    for (var i = 0, l = taskCompanies.length; i < l; ++i)
    {
      var taskCompany = taskCompanies[i];

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
    for (var i = 0, l = count.length; i < l; ++i)
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

    fteMasterEntryStream.on('close', done);

    fteMasterEntryStream.on('data', function(fteMasterEntry)
    {
      var key = '' + fteMasterEntry.date.getTime();

      createDefaultGroupedResult(key);

      var fte = {
        flows: 0,
        tasks: 0,
        prodDenTasks: 0
      };

      for (var i = 0, l = fteMasterEntry.tasks.length; i < l; ++i)
      {
        countFteMasterEntryTaskFte(options, fteMasterEntry.tasks[i], fte);
      }

      if (options.orgUnitType
        && options.orgUnitType !== 'division'
        && options.orgUnitType !== 'subdivision')
      {
        adjustToWorkingOrgUnitsInProduction(key, dateToActiveOrgUnits[key], options, fte);
      }

      results.totals.master += fte.flows + fte.tasks;
      results.totals.prodDenMaster += fte.flows + fte.prodDenTasks;
      results.grouped[key].master += fte.flows + fte.tasks;
      results.grouped[key].prodDenMaster += fte.flows + fte.prodDenTasks;
    });
  }

  function countFteMasterEntryTaskFte(options, task, fte)
  {
    var isProdFlow = task.type === 'prodFlow';

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
