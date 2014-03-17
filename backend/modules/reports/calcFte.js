'use strict';

var lodash = require('lodash');
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

  var results = {
    options: options,
    grouped: {},
    total: {
      master: 0,
      masterFlows: 0,
      masterTasks: 0,
      leader: 0
    }
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

      if (options.orgUnitType)
      {
        activeOrgUnitOptions.orgUnitTypes[options.orgUnitType] = true;
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
        .find({date: {$gte: from, $lt: to}}, {date: 1, 'tasks.companies.count': 1})
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
        .find(conditions, {date: 1, total: 1, tasks: 1})
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
      var orgUnitType = options.orgUnitType;
      var grouped = {};
      var dates = Object.keys(results.grouped);

      for (var i = 0, l = dates.length; i < l; ++i)
      {
        var date = dates[i];
        var fte = results.grouped[date];

        fte = fte.leader
          + (orgUnitType === null ? fte.master : (fte.masterFlows + fte.masterTasks));

        if (!fte)
        {
          continue;
        }

        if (interval === 'shift')
        {
          grouped[date] = fte;
        }
        else if (interval === 'hour')
        {
          var hourFte = fte / 8;

          for (var h = 0; h < 8; ++h)
          {
            date = +date + 3600 * 1000 * h;

            grouped[date] = hourFte;
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
            grouped[groupKey] += fte;
          }
        }
      }

      results.grouped = grouped;

      if (orgUnitType === null)
      {
        results.total = results.total.master + results.total.leader;
      }
      else
      {
        results.total = results.total.masterFlows
          + results.total.masterTasks
          + results.total.leader;
      }
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
        masterFlows: 0,
        masterTasks: 0,
        leader: 0
      };
    }
  }

  function getActiveOrgUnits(options, done)
  {
    var pipeline = [
      {$match: {startedAt: {$gte: options.from, $lt: options.to}}}
    ];

    var $group = {
      _id: '$date',
      division: {$addToSet: '$division'}
    };

    if (options.orgUnitTypes.mrpControllers)
    {
      pipeline.push({$unwind: '$mrpControllers'});
    }

    pipeline.push(
      {$group: applyOrgUnitGroup(options.orgUnitTypes, $group)},
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

  function applyOrgUnitGroup(orgUnitTypes, $group)
  {
    if (orgUnitTypes.subdivision)
    {
      $group.subdivision = {$addToSet: '$subdivision'};
    }

    if (orgUnitTypes.mrpController)
    {
      $group.mrpController = {$addToSet: '$mrpControllers'};
    }

    if (orgUnitTypes.prodFlow)
    {
      $group.prodFlow = {$addToSet: '$prodFlow'};
    }

    if (orgUnitTypes.workCenter)
    {
      $group.workCenter = {$addToSet: '$workCenter'};
    }

    if (orgUnitTypes.prodLine)
    {
      $group.prodLine = {$addToSet: '$prodLine'};
    }

    return $group;
  }

  function countWorkingOrgUnits(activeOrgUnits, options, type)
  {
    if (!options.orgUnits || typeof options.orgUnits !== 'object')
    {
      return 0;
    }

    var allOrgUnits = options.orgUnits[type];

    if (options.orgUnitType === null
      || options.orgUnitType === 'division'
      || !allOrgUnits
      || !allOrgUnits.length)
    {
      return 1;
    }

    if (!activeOrgUnits)
    {
      return 0;
    }

    var workingOrgUnits = lodash.intersection(
      activeOrgUnits[options.orgUnitType].map(String), allOrgUnits
    );

    if (workingOrgUnits.indexOf(options.orgUnitId) === -1)
    {
      return 0;
    }

    return workingOrgUnits.length;
  }

  function handleFteLeaderEntryStream(options, dateToActiveOrgUnits, fteLeaderEntryStream, done)
  {
    fteLeaderEntryStream.on('error', done);

    fteLeaderEntryStream.on('close', done);

    fteLeaderEntryStream.on('data', function(fteLeaderEntry)
    {
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

      var fte = 0;

      for (var i = 0, l = fteLeaderEntry.tasks.length; i < l; ++i)
      {
        fte += countFteLeaderEntryTaskFte(
          fteLeaderEntry.tasks[i].companies,
          options.division,
          activeDivisionsCount
        );
      }

      var workingOrgUnitsCount = countWorkingOrgUnits(activeOrgUnits, options, 'tasks');

      fte = workingOrgUnitsCount === 0 ? 0 : (fte / workingOrgUnitsCount);

      results.total.leader += fte;
      results.grouped[key].leader += fte;
    });
  }

  function countFteLeaderEntryTaskFte(taskCompanies, division, activeDivisionsCount)
  {
    var fte = 0;

    for (var i = 0, l = taskCompanies.length; i < l; ++i)
    {
      var taskCompany = taskCompanies[i];

      if (typeof taskCompany.count === 'number')
      {
        fte += taskCompany.count / activeDivisionsCount;
      }
      else if (Array.isArray(taskCompany.count))
      {
        for (var ii = 0, ll = taskCompany.count.length; ii < ll; ++ii)
        {
          if (division === null || taskCompany.count[ii].division === division)
          {
            fte += taskCompany.count[ii].value;
          }
        }
      }
    }

    return fte;
  }

  function handleFteMasterEntryStream(options, dateToActiveOrgUnits, fteMasterEntryStream, done)
  {
    fteMasterEntryStream.on('error', done);

    fteMasterEntryStream.on('close', done);

    fteMasterEntryStream.on('data', function(fteMasterEntry)
    {
      var key = '' + fteMasterEntry.date.getTime();

      createDefaultGroupedResult(key);

      if (!options.orgUnitType)
      {
        results.total.master += fteMasterEntry.total;
        results.grouped[key].master += fteMasterEntry.total;

        return;
      }

      var fte = {
        flows: 0,
        tasks: 0
      };

      for (var i = 0, l = fteMasterEntry.tasks.length; i < l; ++i)
      {
        countFteMasterEntryTaskFte(options, fteMasterEntry.tasks[i], fte);
      }

      var activeOrgUnits = dateToActiveOrgUnits[key];
      var workingOrgUnitsCountForFlows = countWorkingOrgUnits(activeOrgUnits, options, 'flows');
      var workingOrgUnitsCountForTasks = countWorkingOrgUnits(activeOrgUnits, options, 'tasks');

      fte.flows = workingOrgUnitsCountForFlows === 0
        ? 0
        : (fte.flows / workingOrgUnitsCountForFlows);

      fte.tasks = workingOrgUnitsCountForTasks === 0
        ? 0
        : (fte.tasks / workingOrgUnitsCountForTasks);

      results.total.masterFlows += fte.flows;
      results.total.masterTasks += fte.tasks;
      results.grouped[key].masterFlows += fte.flows;
      results.grouped[key].masterTasks += fte.tasks;
    });
  }

  function countFteMasterEntryTaskFte(options, task, fte)
  {
    var isProdFlow = task.type === 'prodFlow';

    if (task.noPlan || (isProdFlow && !containsProdFlow(options, task)))
    {
      return;
    }

    for (var i = 0, l = task.functions.length; i < l; ++i)
    {
      var taskCompanies = task.functions[i].companies;

      for (var ii = 0, ll = taskCompanies.length; ii < ll; ++ii)
      {
        var count = taskCompanies[ii].count;

        if (isProdFlow)
        {
          fte.flows += count;
        }
        else
        {
          fte.tasks += count;
        }
      }
    }
  }

  function containsProdFlow(options, task)
  {
    return !Array.isArray(options.prodFlows)
      || options.prodFlows.indexOf(task.id.toString()) !== -1;
  }
};
