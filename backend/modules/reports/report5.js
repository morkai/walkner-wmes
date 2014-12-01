// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('./util');

module.exports = function report5(mongoose, options, done)
{
  /*jshint validthis:true*/

  var fromDate = moment(options.fromTime).hours(6).toDate();
  var toDate = moment(options.toTime).hours(6).toDate();

  var results = {
    options: options,
    days: {},
    data: {}
  };

  step(
    function countFteAndFindQtyStep()
    {
      findQuantityDone(this.parallel());
      countFteMasterEntries(this.parallel());
      countFteLeaderEntries(this.parallel());
    },
    function countQuantityDoneStep(err, qtyResults)
    {
      if (err)
      {
        return this.skip(err);
      }

      qtyResults.forEach(function(qtyResult)
      {
        if (qtyResult.qty > 0)
        {
          getDataEntry(qtyResult._id).qty += qtyResult.qty;
        }
      });

      var daysInGroups = {};

      Object.keys(results.days).forEach(function(groupKey)
      {
        daysInGroups[groupKey] = Object.keys(results.days[groupKey]).length;
      });

      results.days = daysInGroups;

      setImmediate(this.next());
    },
    function fillAndSortDataStep()
    {
      var sortedData = [];
      var createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      var lastGroupKey = null;
      var groupKeys = Object.keys(results.data).sort(function(a, b) { return a - b; });
      var lastGroupIndex = groupKeys.length - 1;

      groupKeys.forEach(function(key, i)
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

          while (lastGroupKey < options.toTime)
          {
            sortedData.push(lastGroupKey);

            lastGroupKey = createNextGroupKey(lastGroupKey);
          }
        }
      });

      results.data = sortedData;

      setImmediate(this.next());
    },
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

  function countFteMasterEntries(done)
  {
    var conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      }
    };

    if (Array.isArray(options.subdivisions))
    {
      conditions.subdivision = {$in: options.subdivisions};
    }

    var fields = {
      _id: 0,
      date: 1,
      'tasks.type': 1,
      'tasks.id': 1,
      'tasks.functions': 1
    };

    var stream = mongoose.model('FteMasterEntry').find(conditions, fields).sort({date: 1}).lean().stream();

    stream.on('error', done);
    stream.on('close', done);
    stream.on('data', handleFteMasterEntry);
  }

  function countFteLeaderEntries(done)
  {
    var conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      }
    };

    if (Array.isArray(options.subdivisions))
    {
      conditions.subdivision = {$in: options.subdivisions};
    }

    var fields = {
      _id: 0,
      date: 1,
      'tasks.childCount': 1,
      'tasks.functions.id': 1,
      'tasks.functions.companies.id': 1,
      'tasks.functions.companies.count': 1,
      'tasks.companies.id': 1,
      'tasks.companies.count': 1
    };

    var stream = mongoose.model('FteLeaderEntry').find(conditions, fields).sort({date: 1}).lean().stream();

    stream.on('error', done);
    stream.on('close', done);
    stream.on('data', handleFteLeaderEntry);
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

    mongoose.model('ProdShiftOrder').aggregate(
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

  function handleFteMasterEntry(fteMasterEntry)
  {
    var dataEntry = getDataEntry(fteMasterEntry.date);

    if (dataEntry === null)
    {
      return;
    }

    var tasks = fteMasterEntry.tasks;

    for (var i = 0, l = tasks.length; i < l; ++i)
    {
      var task = tasks[i];
      var isProdFlow = task.type === 'prodFlow';
      var prodFunctions = task.functions;

      for (var ii = 0, ll = prodFunctions.length; ii < ll; ++ii)
      {
        var prodFunction = prodFunctions[ii];
        var directRatio = options.directProdFunctions[prodFunction.id] / 100;
        var companies = prodFunction.companies;

        for (var iii = 0, lll = companies.length; iii < lll; ++iii)
        {
          var company = companies[iii];
          var count = company.count;

          if (count > 0)
          {
            addToDirIndir(dataEntry, isProdFlow, directRatio, prodFunction.id, company.id, count);
          }
        }
      }
    }
  }

  function addToDirIndir(dataEntry, isProdFlow, directRatio, prodFunctionId, companyId, count)
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

  function handleFteLeaderEntry(fteLeaderEntry)
  {
    var dataEntry = getDataEntry(fteLeaderEntry.date);

    if (dataEntry === null)
    {
      return;
    }

    var tasks = fteLeaderEntry.tasks;

    for (var i = 0, l = tasks.length; i < l; ++i)
    {
      var task = tasks[i];

      if (task.childCount > 0)
      {
        continue;
      }

      if (Array.isArray(task.functions) && task.functions.length)
      {
        for (var ii = 0, ll = task.functions.length; ii < ll; ++ii)
        {
          countCompanyDirIndir(dataEntry, task.functions[ii].companies, task.functions[ii].id);
        }
      }
      else
      {
        countCompanyDirIndir(dataEntry, task.companies, 'wh');
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
        addToDirIndir(dataEntry, false, 0, prodFunctionId, company.id, count);
      }
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
    return orgUnitType === 'subdivision' ? new ObjectId(orgUnitId) : orgUnitId;
  }
};
