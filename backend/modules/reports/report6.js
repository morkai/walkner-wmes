// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var lodash = require('lodash');
var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('./util');

module.exports = function(mongoose, options, done)
{
  /*jshint validthis:true*/

  var WhShiftMetrics = mongoose.model('WhShiftMetrics');

  var results = {
    options: options,
    data: {}
  };

  step(
    function handleWhShiftMetricsStep()
    {
      var conditions = {
        _id: {
          $gte: new Date(options.fromTime),
          $lt: new Date(options.toTime)
        }
      };
      var fields = {
        tzOffsetMs: 0
      };

      var stream = WhShiftMetrics.find(conditions, fields).lean().stream();
      var next = this.next();

      stream.on('end', next);
      stream.on('error', next);
      stream.on('data', handleWhShiftMetrics);
    },
    function fillMissingDataStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      var dataMap = results.data;
      var dataList = [];
      var groupKeys = Object.keys(dataMap);

      if (groupKeys.length === 0)
      {
        results.data = dataList;

        return;
      }

      var createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      var fromGroupKey = +groupKeys[0];
      var toGroupKey = +groupKeys[groupKeys.length - 1];

      while (fromGroupKey <= toGroupKey)
      {
        dataList.push(dataMap[fromGroupKey] || {key: fromGroupKey});

        fromGroupKey = createNextGroupKey(fromGroupKey);
      }

      results.data = dataList;
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

  function handleWhShiftMetrics(whShiftMetrics)
  {
    var groupKey = util.createGroupKey(options.interval, whShiftMetrics._id);

    if (results.data[groupKey] === undefined)
    {
      results.data[groupKey] = {key: groupKey};
    }

    var groupData = results.data[groupKey];

    lodash.forEach(whShiftMetrics, function(value, key)
    {
      if (key === '_id')
      {
        return;
      }

      if (groupData[key] === undefined)
      {
        groupData[key] = value;
      }
      else if (typeof value === 'number')
      {
        groupData[key] += value;
      }
      else
      {
        var tasks = groupData[key];

        lodash.forEach(value, function(count, taskId)
        {
          if (tasks[taskId] === undefined)
          {
            tasks[taskId] = count;
          }
          else
          {
            tasks[taskId] += count;
          }
        });
      }
    });
  }
};
