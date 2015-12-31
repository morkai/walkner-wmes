// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var moment = require('moment');
var step = require('h5.step');
var _ = require('lodash');
var util = require('./util');

module.exports = function(mongoose, options, done)
{
  /*jshint validthis:true*/

  var WhShiftMetrics = mongoose.model('WhShiftMetrics');

  var results = {
    options: options,
    data: {}
  };

  var fromDate = moment(options.fromTime).hours(6).toDate();
  var toDate = moment(options.toTime).hours(6).toDate();

  step(
    function handleWhShiftMetricsStep()
    {
      var conditions = {
        _id: {
          $gte: fromDate,
          $lt: toDate
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
        var dataItem = dataMap[fromGroupKey] || {key: fromGroupKey, dayCount: {}};

        dataItem.dayCount = Object.keys(dataItem.dayCount).length;

        dataList.push(dataItem);

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
      results.data[groupKey] = {
        key: groupKey,
        dayCount: {}
      };
    }

    var groupData = results.data[groupKey];

    if ((whShiftMetrics.compTotalFte + whShiftMetrics.finGoodsTotalFte) > 0)
    {
      groupData.dayCount[moment(whShiftMetrics._id).format('YYMMDD')] = true;
    }

    _.forEach(whShiftMetrics, function(value, key)
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

        _.forEach(value, function(count, taskId)
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
