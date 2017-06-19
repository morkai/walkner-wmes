// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const step = require('h5.step');
const _ = require('lodash');
const util = require('./util');

module.exports = function(mongoose, options, done)
{
  /* jshint validthis:true*/

  const WhShiftMetrics = mongoose.model('WhShiftMetrics');

  const results = {
    options: options,
    data: {}
  };

  const fromDate = moment(options.fromTime).hours(6).toDate();
  const toDate = moment(options.toTime).hours(6).toDate();

  step(
    function handleWhShiftMetricsStep()
    {
      const conditions = {
        _id: {
          $gte: fromDate,
          $lt: toDate
        }
      };
      const fields = {
        tzOffsetMs: 0
      };

      const stream = WhShiftMetrics.find(conditions, fields).lean().cursor();
      const next = _.once(this.next());

      stream.on('error', next);
      stream.on('end', next);
      stream.on('data', handleWhShiftMetrics);
    },
    function fillMissingDataStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const dataMap = results.data;
      const dataList = [];
      const groupKeys = Object.keys(dataMap);

      if (groupKeys.length === 0)
      {
        results.data = dataList;

        return;
      }

      const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      let fromGroupKey = +groupKeys[0];
      const toGroupKey = +groupKeys[groupKeys.length - 1];

      while (fromGroupKey <= toGroupKey)
      {
        const dataItem = dataMap[fromGroupKey] || {key: fromGroupKey, dayCount: {}};

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
    const groupKey = util.createGroupKey(options.interval, whShiftMetrics._id);

    if (results.data[groupKey] === undefined)
    {
      results.data[groupKey] = {
        key: groupKey,
        dayCount: {}
      };
    }

    const groupData = results.data[groupKey];

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
        const tasks = groupData[key];

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
