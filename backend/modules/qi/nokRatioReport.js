// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const QiResult = mongoose.model('QiResult');

  const results = {
    options: options,
    total: {},
    division: {},
    divisionTotal: {}
  };

  options.divisions = options.divisions.filter(d => d.type === 'prod');

  options.divisions.forEach(d => results.divisionTotal[d._id] = {
    qtyNok: 0,
    qtyNokInspected: 0,
    ratio: 100
  });

  let minTotalGroupKey = Number.MAX_VALUE;
  let maxTotalGroupKey = Number.MIN_VALUE;
  let minDivisionGroupKey = Number.MAX_VALUE;
  let maxDivisionGroupKey = Number.MIN_VALUE;

  step(
    function findResultsStep()
    {
      const conditions = {
        inspectedAt: {
          $gte: new Date(options.fromTime),
          $lt: new Date(options.toTime)
        },
        ok: false,
        division: {$in: Object.keys(results.divisionTotal)}
      };
      const fields = {
        inspectedAt: 1,
        division: 1,
        qtyNok: 1,
        qtyNokInspected: 1
      };

      QiResult.find(conditions, fields).lean().exec(this.next());
    },
    function(err, qiResults)
    {
      if (err)
      {
        return this.skip(err);
      }

      qiResults.forEach(function(qiResult)
      {
        const totalGroup = getTotalGroup(qiResult);
        const qtyNok = qiResult.qtyNok;
        const qtyNokInspected = qiResult.qtyNokInspected || 0;

        totalGroup.qtyNok += qtyNok;
        totalGroup.qtyNokInspected += qtyNokInspected;

        const divisionGroup = getDivisionGroup(qiResult);

        divisionGroup.qtyNok += qtyNok;
        divisionGroup.qtyNokInspected += qtyNokInspected;

        if (!results.divisionTotal[qiResult.division])
        {
          results.divisionTotal[qiResult.division] = {
            qtyNok: 0,
            qtyNokInspected: 0,
            ratio: 100
          };
        }

        results.divisionTotal[qiResult.division].qtyNok += qtyNok;
        results.divisionTotal[qiResult.division].qtyNokInspected += qtyNokInspected;
      });

      setImmediate(this.next());
    },
    function calcRatiosStep()
    {
      _.forEach(results.total, function(group)
      {
        group.ratio = Math.round((group.qtyNokInspected / group.qtyNok) * 10000) / 100;
      });

      _.forEach(results.division, function(group)
      {
        _.forEach(group, function(division, key)
        {
          if (key === 'key')
          {
            return;
          }

          division.ratio = Math.round((division.qtyNokInspected / division.qtyNok) * 10000) / 100;
        });
      });

      _.forEach(results.divisionTotal, function(division)
      {
        division.ratio = Math.round((division.qtyNokInspected / division.qtyNok) * 10000) / 100;
      });

      setImmediate(this.next());
    },
    function finalizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const createNextTotalGroupKey = util.createCreateNextGroupKey('month');
      const createNextDivisionGroupKey = util.createCreateNextGroupKey('week');
      const totalGroups = [];
      const divisionGroups = [];
      let groupKey = minTotalGroupKey;

      while (groupKey <= maxTotalGroupKey)
      {
        const toTime = createNextTotalGroupKey(groupKey);
        const group = results.total[groupKey] || {
          key: groupKey,
          qtyNok: 0,
          qtyNokInspected: 0,
          ratio: 0
        };

        totalGroups.push(group);

        groupKey = toTime;
      }

      groupKey = minDivisionGroupKey;

      while (groupKey <= maxDivisionGroupKey)
      {
        const toTime = createNextDivisionGroupKey(groupKey);
        const group = results.division[groupKey] || {
          key: groupKey
        };

        divisionGroups.push(group);

        groupKey = toTime;
      }

      results.total = totalGroups;
      results.division = divisionGroups;

      return setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      return done(err, results);
    }
  );

  function getTotalGroup(qiResult)
  {
    const groupKey = util.createGroupKey('month', qiResult.inspectedAt, true);

    if (groupKey < minTotalGroupKey)
    {
      minTotalGroupKey = groupKey;
    }

    if (groupKey > maxTotalGroupKey)
    {
      maxTotalGroupKey = groupKey;
    }

    if (!results.total[groupKey])
    {
      results.total[groupKey] = {
        key: groupKey,
        qtyNok: 0,
        qtyNokInspected: 0,
        ratio: 0
      };
    }

    return results.total[groupKey];
  }

  function getDivisionGroup(qiResult)
  {
    const groupKey = util.createGroupKey('week', qiResult.inspectedAt, true);

    if (groupKey < minDivisionGroupKey)
    {
      minDivisionGroupKey = groupKey;
    }

    if (groupKey > maxDivisionGroupKey)
    {
      maxDivisionGroupKey = groupKey;
    }

    if (!results.division[groupKey])
    {
      results.division[groupKey] = {
        key: groupKey
      };
    }

    if (!results.division[groupKey][qiResult.division])
    {
      results.division[groupKey][qiResult.division] = {
        qtyNok: 0,
        qtyNokInspected: 0,
        ratio: 0
      };
    }

    return results.division[groupKey][qiResult.division];
  }
};
