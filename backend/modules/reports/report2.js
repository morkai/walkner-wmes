// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const moment = require('moment');
const util = require('./util');

module.exports = function(mongoose, options, done)
{
  /* jshint validthis:true*/

  const ClipOrderCount = mongoose.model('ClipOrderCount');

  const results = {
    options: options,
    clip: []
  };

  step(
    countOrdersStep,
    groupOrderCountResultsStep,
    calcClipStep,
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

  function countOrdersStep()
  {
    const conditions = {
      date: {$gte: new Date(options.fromTime), $lt: new Date(options.toTime)},
      mrp: {$in: options.mrpControllers}
    };
    const groupOperator = getGroupOperator(options.interval);

    ClipOrderCount.aggregate(
      {$match: conditions},
      {$group: {
        _id: groupOperator,
        all: {$sum: '$all'},
        cnf: {$sum: '$cnf'},
        dlv: {$sum: '$dlv'}
      }},
      {$sort: {_id: 1}},
      this.parallel()
    );
  }

  function groupOrderCountResultsStep(err, clipResults)
  {
    if (err)
    {
      return this.done(done, err);
    }

    if (!clipResults)
    {
      return;
    }

    const totalMap = {};
    const productionMap = {};
    const endToEndMap = {};
    let from = options.toTime;
    let to = options.fromTime;
    let i;
    let l;
    let startTime;

    for (i = 0, l = clipResults.length; i < l; ++i)
    {
      const result = clipResults[i];

      startTime = getStartTimeFromGroupKey(options.interval, result._id);

      if (startTime < from)
      {
        from = startTime;
      }

      if (startTime > to)
      {
        to = startTime;
      }

      totalMap[startTime] = (totalMap[startTime] === undefined ? 0 : totalMap[startTime]) + result.all;
      productionMap[startTime] = (productionMap[startTime] === undefined ? 0 : productionMap[startTime]) + result.cnf;
      endToEndMap[startTime] = (endToEndMap[startTime] === undefined ? 0 : endToEndMap[startTime]) + result.dlv;
    }

    this.fromGroupKey = from;
    this.toGroupKey = to;
    this.totalMap = totalMap;
    this.productionMap = productionMap;
    this.endToEndMap = endToEndMap;

    setImmediate(this.next());
  }

  function calcClipStep()
  {
    const createNextGroupKey = util.createCreateNextGroupKey(options.interval);

    while (this.fromGroupKey <= this.toGroupKey)
    {
      const groupKey = this.fromGroupKey.toString();
      const orderCount = this.totalMap[groupKey];
      const production = this.productionMap[groupKey] / orderCount;
      const endToEnd = this.endToEndMap[groupKey] / orderCount;
      const day = new Date(this.fromGroupKey).getDay();

      if (options.interval !== 'day' || (day !== 0 && day !== 6))
      {
        results.clip.push({
          key: this.fromGroupKey,
          orderCount: orderCount,
          productionCount: this.productionMap[groupKey] || 0,
          endToEndCount: this.endToEndMap[groupKey] || 0,
          production: isNaN(production) ? undefined : util.round(production),
          endToEnd: isNaN(endToEnd) ? undefined : util.round(endToEnd)
        });
      }

      this.fromGroupKey = createNextGroupKey(this.fromGroupKey);
    }

    this.fromGroupKey = null;
    this.toGroupKey = null;
    this.totalMap = null;
    this.productionMap = null;
    this.endToEndMap = null;
  }
};

function getGroupOperator(interval)
{
  const operator = {};
  const addTzOffsetMs = [{$add: ['$date', '$tzOffsetMs']}];

  operator.y = {$year: addTzOffsetMs};

  if (interval === 'week')
  {
    operator.w = {$week: addTzOffsetMs};
  }
  else
  {
    operator.m = {$month: addTzOffsetMs};

    if (interval === 'day')
    {
      operator.d = {$dayOfMonth: addTzOffsetMs};
    }
  }

  return operator;
}

function getStartTimeFromGroupKey(interval, groupKey)
{
  let startTimeStr = groupKey.y + '-';

  if (interval === 'week')
  {
    startTimeStr += 'W' + util.pad0(groupKey.w + 1) + '-1';
  }
  else
  {
    startTimeStr += util.pad0(groupKey.m) + '-' + (interval === 'day' ? util.pad0(groupKey.d) : '01');
  }

  const groupKeyMoment = moment(startTimeStr);

  if (interval === 'quarter')
  {
    groupKeyMoment.startOf('quarter');
  }

  return groupKeyMoment.valueOf();
}
