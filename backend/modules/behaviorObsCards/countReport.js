// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const User = mongoose.model('User');
  const KaizenSection = mongoose.model('KaizenSection');
  const BehaviorObsCard = mongoose.model('BehaviorObsCard');

  const groupProperty = 'date';
  const results = {
    options: options,
    categories: {},
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
    function findBehaviorObsCardsStep()
    {
      const conditions = {};
      const sort = {
        [groupProperty]: 1
      };
      const fields = {
        date: 1,
        observer: 1,
        section: 1,
        observerSection: 1,
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

      if (options.shift)
      {
        conditions.shift = options.shift;
      }

      if (options.sections.length === 1)
      {
        conditions.section = options.sections[0];
      }
      else if (options.sections.length)
      {
        conditions.section = {$in: options.sections};
      }

      if (options.observerSections && options.observerSections.length === 1)
      {
        conditions.observerSection = options.observerSections[0];
      }
      else if (options.observerSections && options.observerSections.length)
      {
        conditions.observerSection = {$in: options.observerSections};
      }

      if (options.company && options.company.length === 1)
      {
        conditions.company = options.company[0];
      }
      else if (options.company && options.company.length)
      {
        conditions.company = {$in: options.company};
      }

      if (options.superior)
      {
        conditions['superior.id'] = options.superior;
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

      const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      let groupKey = minGroupKey;
      const groups = [];

      while (groupKey <= maxGroupKey)
      {
        groups.push(results.groups[groupKey] || groupKey);

        groupKey = createNextGroupKey(groupKey);
      }

      results.groups = groups;

      _.forEach([
        'countBySection',
        'countByObserverSection',
        'safeBySection',
        'riskyBySection',
        'categories',
        'observers'
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
      countByObserverSection: {},
      safe: 0,
      safeBySection: {},
      risky: 0,
      riskyBySection: {},
      categories: {},
      categoriesBySection: {},
      observers: {}
    };
  }

  function handleBehaviorObsCard(card)
  {
    const observer = User.transliterateName(card.observer.label);
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

    if (!results.users[observer])
    {
      results.users[observer] = card.observer.label;
      results.totals.observers[observer] = 0;
    }

    results.totals.observers[observer] += 1;

    if (!results.sections[card.section])
    {
      results.sections[card.section] = card.section;
    }

    inc('count');

    if (card.observerSection)
    {
      if (!results.sections[card.observerSection])
      {
        results.sections[card.observerSection] = card.observerSection;
      }

      if (!totals.countByObserverSection[card.observerSection])
      {
        totals.countByObserverSection[card.observerSection] = 0;
      }

      if (!group.countByObserverSection[card.observerSection])
      {
        group.countByObserverSection[card.observerSection] = 0;
      }

      totals.countByObserverSection[card.observerSection] += 1;
      group.countByObserverSection[card.observerSection] += 1;
    }

    if (!group.observers[observer])
    {
      group.observers[observer] = 0;
    }

    group.observers[observer] += 1;

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
