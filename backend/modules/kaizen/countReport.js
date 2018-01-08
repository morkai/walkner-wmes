// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const User = mongoose.model('User');
  const KaizenOrder = mongoose.model('KaizenOrder');

  const groupProperty = 'eventDate';
  let minGroupKey = Number.MAX_VALUE;
  let maxGroupKey = Number.MIN_VALUE;
  const results = {
    options: options,
    users: {},
    totals: createGroup(),
    groups: {}
  };

  step(
    function findKaizenOrdersStep()
    {
      const conditions = {};
      const sort = {};

      sort[groupProperty] = 1;

      if (options.fromTime)
      {
        conditions[groupProperty] = {$gte: new Date(options.fromTime)};
      }

      if (options.toTime)
      {
        if (!conditions[groupProperty])
        {
          conditions[groupProperty] = {};
        }

        conditions[groupProperty].$lt = new Date(options.toTime);
      }

      if (options.sections.length === 1)
      {
        conditions.section = options.sections[0];
      }
      else if (options.sections.length)
      {
        conditions.section = {$in: options.sections};
      }

      const stream = KaizenOrder.find(conditions, {changes: 0}).sort(sort).lean().cursor();
      const next = _.once(this.next());

      stream.on('error', next);
      stream.on('end', next);
      stream.on('data', handleKaizenOrder);
    },
    function finalizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      let groupKey = minGroupKey;
      const groups = [];

      while (groupKey <= maxGroupKey)
      {
        groups.push(results.groups[groupKey] || groupKey);

        groupKey = createNextGroupKey(groupKey);
      }

      results.groups = groups;

      sortOwnerTotals();

      _.forEach([
        'status',
        'section',
        'area',
        'cause',
        'risk',
        'behaviour',
        'nearMissCategory',
        'suggestionCategory',
        'confirmer'
      ], sortTotals);

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
      count: 0,
      type: {},
      status: {},
      section: {},
      area: {},
      cause: {},
      risk: {},
      behaviour: {},
      nearMissCategory: {},
      suggestionCategory: {},
      confirmer: {},
      owner: {}
    };
  }

  function handleKaizenOrder(ko)
  {
    const totals = results.totals;
    const groupKey = util.createGroupKey(options.interval, ko[groupProperty], false);
    let group = results.groups[groupKey];

    if (groupKey < minGroupKey)
    {
      minGroupKey = groupKey;
    }

    if (groupKey > maxGroupKey)
    {
      maxGroupKey = groupKey;
    }

    if (!group)
    {
      group = results.groups[groupKey] = createGroup(groupKey);
    }

    totals.count += 1;
    group.count += 1;

    _.forEach(ko.types, function(type) { inc('type', type); });

    inc('status');
    inc('section');
    inc('area');
    inc('cause');
    inc('risk');
    inc('behaviour');
    inc('nearMissCategory');
    inc('suggestionCategory');

    const confirmer = ko.confirmer;

    if (confirmer)
    {
      const id = User.transliterateName(confirmer.label);

      results.users[id] = confirmer.label;

      if (!totals.confirmer[id])
      {
        totals.confirmer[id] = 0;
      }

      totals.confirmer[id] += 1;

      if (!group.confirmer[id])
      {
        group.confirmer[id] = 0;
      }

      group.confirmer[id] += 1;
    }

    incOwners('nearMiss', ko.nearMissOwners);
    incOwners('suggestion', ko.suggestionOwners);
    incOwners('kaizen', ko.kaizenOwners);

    function inc(metricProperty, metricKey)
    {
      if (metricKey === undefined)
      {
        metricKey = ko[metricProperty];
      }

      if (!metricKey)
      {
        return;
      }

      if (!totals[metricProperty][metricKey])
      {
        totals[metricProperty][metricKey] = 1;
      }
      else
      {
        totals[metricProperty][metricKey] += 1;
      }

      if (!group[metricProperty][metricKey])
      {
        group[metricProperty][metricKey] = 1;
      }
      else
      {
        group[metricProperty][metricKey] += 1;
      }
    }

    function incOwners(type, owners)
    {
      const totalsByOwner = totals.owner;
      const groupByOwner = group.owner;

      _.forEach(owners, function(owner)
      {
        const id = User.transliterateName(owner.label);

        results.users[id] = owner.label;

        if (!totalsByOwner[id])
        {
          totalsByOwner[id] = {total: 0};
        }

        totalsByOwner[id].total += 1;
        totalsByOwner[id][type] = (totalsByOwner[id][type] || 0) + 1;

        if (!groupByOwner[id])
        {
          groupByOwner[id] = {total: 0};
        }

        groupByOwner[id].total += 1;
        groupByOwner[id][type] = (groupByOwner[id][type] || 0) + 1;
      });
    }
  }

  function sortTotals(property)
  {
    const totals = [];

    _.forEach(results.totals[property], function(value, key)
    {
      totals.push([key, value]);
    });

    results.totals[property] = totals.sort(function(a, b) { return b[1] - a[1]; });
  }

  function sortOwnerTotals()
  {
    const totals = [];

    _.forEach(results.totals.owner, function(values, key)
    {
      totals.push([key, values.total, values.nearMiss || 0, values.suggestion || 0, values.kaizen || 0]);
    });

    results.totals.owner = totals.sort(function(a, b) { return b[1] - a[1]; });
  }
};
