// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');
const businessDays = require('../reports/businessDays');

module.exports = function(mongoose, options, done)
{
  const QiResult = mongoose.model('QiResult');

  const results = {
    options: options,
    users: {},
    divisions: {},
    groups: {}
  };

  let minGroupKey = Number.MAX_VALUE;
  let maxGroupKey = Number.MIN_VALUE;

  step(
    function findResultsStep()
    {
      const conditions = {};
      const sort = {
        inspectedAt: 1
      };
      const fields = {
        rid: 1,
        ok: 1,
        inspectedAt: 1,
        division: 1,
        productFamily: 1,
        kind: 1,
        errorCategory: 1,
        faultCode: 1,
        qtyNok: 1
      };

      if (options.fromTime)
      {
        conditions.inspectedAt = {$gte: new Date(options.fromTime)};
      }

      if (options.toTime)
      {
        if (!conditions.inspectedAt )
        {
          conditions.inspectedAt  = {};
        }

        conditions.inspectedAt.$lt = new Date(options.toTime);
      }

      const productFamilies = options.productFamilies
        .split(/[^a-zA-Z0-9]/)
        .filter(d => !!d.length)
        .map(d => new RegExp('^' + d, 'i'));

      if (productFamilies.length)
      {
        conditions.productFamily = {$in: productFamilies};
      }

      if (options.kinds.length)
      {
        conditions.kind = {$in: options.kinds};
      }

      if (options.errorCategories.length)
      {
        conditions.errorCategory = {$in: options.errorCategories};
      }

      if (options.faultCodes.length)
      {
        conditions.faultCode = {$in: options.faultCodes};
      }

      if (!_.isEmpty(options.inspector))
      {
        conditions['inspector.id'] = options.inspector;
      }

      const stream = QiResult.find(conditions, fields).sort(sort).lean().stream();
      const next = this.next();

      stream.on('error', next);
      stream.on('close', next);
      stream.on('data', handleQiResult);
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

      while (groupKey <= maxGroupKey)
      {
        const fromTime = groupKey;
        const toTime = createNextGroupKey(groupKey);
        const group = results.groups[groupKey] || createGroup(groupKey);

        group.workingDayCount = businessDays.countBetweenDates(fromTime, toTime);

        groups.push(group);

        groupKey = toTime;
      }

      results.groups = groups;

      return setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      return done(err, results);
    }
  );

  function createGroup(key)
  {
    return {
      key: key,
      workingDayCount: 1,
      totalNokCount: 0,
      nokCountPerDivision: {},
      nokQtyPerFamily: {}
    };
  }

  function handleQiResult(qiResult)
  {
    const groupKey = util.createGroupKey(options.interval, qiResult.inspectedAt, false);
    let group = results.groups[groupKey];

    if (!group)
    {
      group = results.groups[groupKey] = createGroup(groupKey);
    }

    if (groupKey < minGroupKey)
    {
      minGroupKey = groupKey;
    }

    if (groupKey > maxGroupKey)
    {
      maxGroupKey = groupKey;
    }

    results.divisions[qiResult.division] = 1;

    if (!qiResult.ok)
    {
      incNokCount(group, qiResult);

      if (qiResult.qtyNok)
      {
        incNokQty(group, qiResult);
      }
    }
  }

  function incNokCount(group, qiResult)
  {
    group.totalNokCount += 1;

    if (!group.nokCountPerDivision[qiResult.division])
    {
      group.nokCountPerDivision[qiResult.division] = 0;
    }

    group.nokCountPerDivision[qiResult.division] += 1;
  }

  function incNokQty(group, qiResult)
  {
    let nokQtyPerFamily = group.nokQtyPerFamily[qiResult.productFamily];

    if (!nokQtyPerFamily)
    {
      nokQtyPerFamily = group.nokQtyPerFamily[qiResult.productFamily] = {
        count: 0,
        qty: 0,
        ridPerFault: {}
      };
    }

    nokQtyPerFamily.count += 1;
    nokQtyPerFamily.qty += qiResult.qtyNok;

    let ridPerFault = nokQtyPerFamily.ridPerFault[qiResult.faultCode];

    if (!ridPerFault)
    {
      ridPerFault = nokQtyPerFamily.ridPerFault[qiResult.faultCode] = [];
    }

    ridPerFault.push(qiResult.rid);
  }
};
