// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const User = mongoose.model('User');
  const KaizenSection = mongoose.model('KaizenSection');
  const MinutesForSafetyCard = mongoose.model('MinutesForSafetyCard');

  const groupProperty = 'date';
  const results = {
    options,
    sections: {},
    users: {},
    totals: createGroup(),
    groups: {}
  };

  let minGroupKey = Number.MAX_VALUE;
  let maxGroupKey = Number.MIN_VALUE;

  step(
    async function findSectionsStep()
    {
      (await KaizenSection.find({}, {name: 1}).lean().exec()).forEach(s => results.sections[s._id] = s.name);
    },
    function findMinutesForSafetyCardsStep()
    {
      const conditions = {};
      const sort = {
        [groupProperty]: 1
      };
      const fields = {
        date: 1,
        owner: 1,
        section: 1,
        participants: 1
      };

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

      if (options.owner)
      {
        conditions['owner.id'] = options.owner;
      }

      const stream = MinutesForSafetyCard.find(conditions, fields).sort(sort).lean().cursor();
      const next = _.once(this.next());

      stream.on('error', next);
      stream.on('end', next);
      stream.on('data', handleMinutesForSafetyCard);
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

      while (groupKey && groupKey <= maxGroupKey)
      {
        groups.push(results.groups[groupKey] || groupKey);

        groupKey = createNextGroupKey(groupKey);
      }

      results.groups = groups;

      [
        'countBySection',
        'owners',
        'participants',
        'engaged'
      ].forEach(sortTotals);

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
      countBySection: {},
      owners: {},
      participants: {},
      engaged: {}
    };
  }

  function handleMinutesForSafetyCard(card)
  {
    const owner = User.transliterateName(card.owner.label);
    const totals = results.totals;
    const groupKey = util.createGroupKey(options.interval, card[groupProperty], false);
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

    if (!results.users[owner])
    {
      results.users[owner] = card.owner.label;
      results.totals.owners[owner] = 0;
      results.totals.engaged[owner] = 0;
    }

    results.totals.owners[owner] += 1;
    results.totals.engaged[owner] += 1;

    if (!results.sections[card.section])
    {
      results.sections[card.section] = card.section;
    }

    inc('count');

    if (!group.owners[owner])
    {
      group.owners[owner] = 0;
    }

    group.owners[owner] += 1;

    card.participants.forEach(user =>
    {
      const participant = User.transliterateName(card.owner.label);

      if (!results.users[participant])
      {
        results.users[participant] = user.label;
      }

      [
        results.totals.participants,
        results.totals.engaged,
        group.participants,
        group.engaged
      ].forEach(g =>
      {
        if (!g[participant])
        {
          g[participant] = 0;
        }

        g[participant] += 1;
      });
    });

    function inc(metricKey)
    {
      totals[metricKey] += 1;
      group[metricKey] += 1;

      const metricKeyBySection = `${metricKey}BySection`;

      if (!totals[metricKeyBySection][card.section])
      {
        totals[metricKeyBySection][card.section] = 0;
      }

      if (!group[metricKeyBySection][card.section])
      {
        group[metricKeyBySection][card.section] = 0;
      }

      totals[metricKeyBySection][card.section] += 1;
      group[metricKeyBySection][card.section] += 1;
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
};
