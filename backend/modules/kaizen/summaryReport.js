// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const User = mongoose.model('User');
  const KaizenOrder = mongoose.model('KaizenOrder');

  let minGroupKey = Number.MAX_VALUE;
  let maxGroupKey = Number.MIN_VALUE;
  const results = {
    options: options,
    users: {},
    nearMissOwners: {},
    suggestionOwners: {},
    kaizenOwners: {},
    averageDuration: 0,
    count: {
      total: 0,
      open: 0,
      finished: 0,
      cancelled: 0
    },
    groups: {}
  };

  step(
    function findKaizenOrdersStep()
    {
      const conditions = {};

      if (options.fromTime)
      {
        conditions.eventDate = {$gte: new Date(options.fromTime)};
      }

      if (options.toTime)
      {
        if (!conditions.eventDate)
        {
          conditions.eventDate = {};
        }

        conditions.eventDate.$lt = new Date(options.toTime);
      }

      if (options.section.length === 1)
      {
        conditions.section = options.section[0];
      }
      else if (options.section.length > 1)
      {
        conditions.section = {$in: options.section};
      }

      if (options.confirmer.length === 1)
      {
        conditions['confirmer.id'] = options.confirmer[0];
      }
      else if (options.confirmer.length > 1)
      {
        conditions['confirmer.id'] = {$in: options.confirmer};
      }

      const stream = KaizenOrder.find(conditions, {changes: 0}).lean().cursor();
      const next = _.once(this.next());

      stream.on('error', next);
      stream.on('end', next);
      stream.on('data', handleKaizenOrder);
    },
    function summarizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const createNextGroupKey = util.createCreateNextGroupKey('week');
      let groupKey = minGroupKey;
      const groups = [];

      while (groupKey <= maxGroupKey)
      {
        const group = results.groups[groupKey] || createGroup(groupKey);

        results.averageDuration += group.averageDuration;
        results.count.total += group.count.open + group.count.finished + group.count.cancelled;
        results.count.open += group.count.open;
        results.count.finished += group.count.finished;
        results.count.cancelled += group.count.cancelled;

        group.averageDuration = util.round(group.averageDuration / (group.count.open + group.count.finished));

        groups.push(group);

        groupKey = createNextGroupKey(groupKey);
      }

      results.groups = groups;
      results.nearMissOwners = sortOwners(results.nearMissOwners);
      results.suggestionOwners = sortOwners(results.suggestionOwners);
      results.kaizenOwners = sortOwners(results.kaizenOwners);
      results.averageDuration = util.round(results.averageDuration / (results.count.open + results.count.finished));

      return setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      return done(err, results);
    }
  );

  function handleKaizenOrder(s)
  {
    const groupKey = util.createGroupKey('week', s.eventDate, false);
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

    const cancelled = s.status === 'cancelled';
    const statusProperty = cancelled ? 'cancelled' : s.status === 'finished' ? 'finished' : 'open';

    if (_.includes(s.types, 'nearMiss'))
    {
      _.forEach(s.nearMissOwners, incOwner.bind(null, 'nearMissOwners', statusProperty));
    }

    if (_.includes(s.types, 'suggestion'))
    {
      _.forEach(s.suggestionOwners, incOwner.bind(null, 'suggestionOwners', statusProperty));
    }

    if (_.includes(s.types, 'kaizen'))
    {
      _.forEach(s.kaizenOwners, incOwner.bind(null, 'kaizenOwners', statusProperty));
    }

    if (!cancelled)
    {
      group.averageDuration += s.finishDuration;
    }

    group.count[statusProperty] += 1;
  }

  function createGroup(key)
  {
    return {
      key: key,
      count: {
        open: 0,
        finished: 0,
        cancelled: 0
      },
      averageDuration: 0
    };
  }

  function incOwner(ownersProperty, statusProperty, owner)
  {
    const id = User.transliterateName(owner.label);

    results.users[id] = owner.label;

    if (!results[ownersProperty][id])
    {
      results[ownersProperty][id] = {
        open: 0,
        finished: 0,
        cancelled: 0
      };
    }

    results[ownersProperty][id][statusProperty] += 1;
  }

  function sortOwners(unsorted)
  {
    const sorted = [];

    _.forEach(unsorted, function(values, key)
    {
      sorted.push([
        key,
        values.open + values.finished + values.cancelled,
        values.open,
        values.finished,
        values.cancelled
      ]);
    });

    return sorted.sort(function(a, b) { return b[1] - a[1]; });
  }
};
