// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const PaintShopLoad = mongoose.model('PaintShopLoad');

  const results = {
    options,
    groups: {}
  };

  if (!options.fromTime)
  {
    options.fromTime = moment().startOf('day').subtract(30, 'days').valueOf();
    options.toTime = 0;
    options.interval = 'day';
  }

  if (!options.toTime)
  {
    options.toTime = Date.now();
  }

  options.fromTime = moment(options.fromTime).startOf('day').hours(6).valueOf();
  options.toTime = moment(options.toTime).startOf('day').hours(6).valueOf();

  const timeDiff = options.toTime - options.fromTime;
  let maxGroups = timeDiff / util.getIntervalSize(options.interval);

  while (maxGroups > 1000)
  {
    options.interval = util.getNextInterval(options.interval);
    maxGroups = timeDiff / util.getIntervalSize(options.interval);
  }

  step(
    function()
    {
      const next = _.once(this.next());
      const cursor = PaintShopLoad
        .find({_id: {$gte: options.fromTime, $lt: options.toTime}})
        .lean()
        .cursor({batchSize: 50});

      cursor.on('error', next);
      cursor.on('end', next);
      cursor.on('data', handleItem);
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const groupKeys = Object.keys(results.groups).sort();
      const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      const groups = [];
      const lastGroupKey = +_.last(groupKeys);
      let groupKey = +groupKeys[0];

      while (groupKey <= lastGroupKey)
      {
        const group = getGroup(groupKey);

        group.sumDuration += (group.sumDuration / (group.count - group.zeroCount) * group.zeroCount) || 0;

        groups.push({
          key: groupKey,
          minDuration: group.minDuration,
          maxDuration: group.maxDuration,
          avgDuration: Math.ceil(group.sumDuration / group.count) || 0,
          count: group.count
        });

        groupKey = createNextGroupKey(groupKey);
      }

      results.groups = groups;

      setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      return done(err, results);
    }
  );

  function getGroup(date)
  {
    const key = util.createGroupKey(options.interval, date, false);

    if (!results.groups[key])
    {
      results.groups[key] = {
        sumDuration: 0,
        minDuration: Number.MAX_SAFE_INTEGER,
        maxDuration: 0,
        avgDuration: 0,
        zeroCount: 0,
        count: 0
      };
    }

    return results.groups[key];
  }

  function handleItem(item)
  {
    const group = getGroup(item._id);
    const duration = Math.round(item.d / 1000);

    group.count += 1;
    group.sumDuration += duration;

    if (duration > 0)
    {
      if (duration > group.maxDuration)
      {
        group.maxDuration = duration;
      }

      if (duration < group.minDuration)
      {
        group.minDuration = duration;
      }
    }
    else
    {
      group.zeroCount += 1;
    }
  }
};
