// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const KaizenSection = mongoose.model('KaizenSection');
  const BehaviorObsCard = mongoose.model('BehaviorObsCard');

  const groupProperty = 'date';
  const results = {
    options: options,
    categories: {},
    sections: {},
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
    function findBehaviorObsCardsStep()
    {
      const conditions = {};
      const sort = {
        [groupProperty]: 1
      };
      const fields = {
        date: 1,
        section: 1,
        observations: 1
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

      const stream = BehaviorObsCard.find(conditions, fields).sort(sort).lean().cursor();
      const next = _.once(this.next());

      stream.on('error', next);
      stream.on('end', next);
      stream.on('data', handleBehaviorObsCard);
    },
    function finalizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      var createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      var groupKey = minGroupKey;
      var groups = [];

      while (groupKey <= maxGroupKey)
      {
        groups.push(results.groups[groupKey] || groupKey);

        groupKey = createNextGroupKey(groupKey);
      }

      results.groups = groups;

      _.forEach([
        'countBySection',
        'safeBySection',
        'riskyBySection',
        'categories'
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
      countBySection: {},
      safe: 0,
      safeBySection: {},
      risky: 0,
      riskyBySection: {},
      categories: {},
      categoriesBySection: {}
    };
  }

  function handleBehaviorObsCard(card)
  {
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

    if (!results.sections[card.section])
    {
      results.sections[card.section] = card.section;
    }

    inc('count');

    card.observations.forEach(o =>
    {
      if (o.safe)
      {
        inc('safe');

        return;
      }

      inc('risky');

      results.categories[o.id] = o.behavior;

      if (!totals.categories[o.id])
      {
        totals.categories[o.id] = 0;
        totals.categoriesBySection[o.id] = {};
      }

      if (!group.categories[o.id])
      {
        group.categories[o.id] = 0;
        group.categoriesBySection[o.id] = {};
      }

      totals.categories[o.id] += 1;
      group.categories[o.id] += 1;

      if (!totals.categoriesBySection[o.id][card.section])
      {
        totals.categoriesBySection[o.id][card.section] = 0;
      }

      if (!group.categoriesBySection[o.id][card.section])
      {
        group.categoriesBySection[o.id][card.section] = 0;
      }

      totals.categoriesBySection[o.id][card.section] += 1;
      group.categoriesBySection[o.id][card.section] += 1;
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
