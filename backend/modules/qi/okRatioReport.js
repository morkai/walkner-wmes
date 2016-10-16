// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const QiResult = mongoose.model('QiResult');
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');

  const DIVISIONS = {};

  const results = {
    options: options,
    total: {
      prod: createEmptyDivision(),
      wh: createEmptyDivision()
    },
    groups: {}
  };

  options.divisions.forEach(function(division)
  {
    if (division.type === 'other')
    {
      return;
    }

    DIVISIONS[division._id] = division;
    results.total[division._id] = createEmptyDivision();
  });

  const EMPTY_DIVISIONS = _.cloneDeep(results.total);
  const DIVISION_KEYS = Object.keys(EMPTY_DIVISIONS);

  let minGroupKey = Number.MAX_VALUE;
  let maxGroupKey = Number.MIN_VALUE;

  step(
    function findResultsStep()
    {
      ProdShiftOrder.aggregate([
        {$match: {
          startedAt: {
            $gte: moment(options.fromTime).hours(6).toDate(),
            $lt: moment(options.toTime).hours(6).toDate()
          },
          workCenter: {$not: /^SPARE/},
          mechOrder: false
        }},
        {$group: {
          _id: {
            division: '$division',
            y: {$year: '$date'},
            m: {$month: '$date'}
          },
          all: {$sum: '$quantityDone'}
        }}
      ], this.parallel());

      QiResult.aggregate([
        {$match: {
          inspectedAt: {
            $gte: new Date(options.fromTime),
            $lt: new Date(options.toTime)
          }
        }},
        {$group: {
          _id: {
            division: '$division',
            y: {$year: '$inspectedAt'},
            m: {$month: '$inspectedAt'}
          },
          nok: {$sum: '$qtyNok'}
        }}
      ], this.parallel());
    },
    function(err, orderResults, qiResults)
    {
      if (err)
      {
        return this.skip(err);
      }

      orderResults.forEach(handleResult.bind(null, 'all'));
      qiResults.forEach(handleResult.bind(null, 'nok'));
    },
    function finalizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      const groups = [];
      let groupKey = minGroupKey;

      calcRatios(results.total);

      while (groupKey <= maxGroupKey)
      {
        const toTime = createNextGroupKey(groupKey);
        const group = results.groups[groupKey] || createGroup(groupKey);
        const whQtyKey = moment(groupKey).format('YYYYMM');
        const whQty = options.whQty[whQtyKey];

        if (whQty)
        {
          results.total.wh.all += whQty;
          group.wh.all = whQty;

          delete options.whQty[whQtyKey];
        }

        calcRatios(group);

        groups.push(group);

        groupKey = toTime;
      }

      results.groups = groups;

      return setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      delete options.whQty;

      return done(err, results);
    }
  );

  function createGroupKey(year, month)
  {
    return new Date(year, month - 1, 1, 0, 0, 0, 0).valueOf();
  }

  function createGroup(key)
  {
    return Object.assign(_.cloneDeep(EMPTY_DIVISIONS), {key: key});
  }

  function createEmptyDivision()
  {
    return {
      all: 0,
      nok: 0,
      ratio: 1
    };
  }

  function handleResult(kind, result)
  {
    const groupKey = createGroupKey(result._id.y, result._id.m);

    if (groupKey < minGroupKey)
    {
      minGroupKey = groupKey;
    }

    if (groupKey > maxGroupKey)
    {
      maxGroupKey = groupKey;
    }

    const group = results.groups[groupKey] || createGroup(groupKey);
    const division = DIVISIONS[result._id.division];

    if (!division)
    {
      return;
    }

    if (division.type === 'prod')
    {
      group.prod[kind] += result[kind];
      results.total.prod[kind] += result[kind];
    }
    else
    {
      group.wh[kind] += result[kind];
      results.total.wh[kind] += result[kind];
    }

    group[division._id][kind] += result[kind];
    results.total[division._id][kind] += result[kind];

    results.groups[groupKey] = group;
  }

  function calcRatios(group)
  {
    DIVISION_KEYS.forEach(function(division)
    {
      const all = group[division].all;
      const nok = group[division].nok;

      group[division].ratio = all === 0 ? 0 : util.round(100 - ((nok / all) * 100));
    });
  }
};
