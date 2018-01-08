// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const User = mongoose.model('User');
  const Suggestion = mongoose.model('Suggestion');

  const groupProperty = 'date';
  let minGroupKey = Number.MAX_VALUE;
  let maxGroupKey = Number.MIN_VALUE;
  const results = {
    options: options,
    users: {},
    totals: createGroup(),
    groups: {}
  };

  step(
    function findSuggestionsStep()
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

      if (options.categories.length === 1)
      {
        conditions.categories = options.categories[0];
      }
      else if (options.categories.length)
      {
        conditions.categories = {$in: options.categories};
      }

      const stream = Suggestion.find(conditions, {changes: 0}).sort(sort).lean().cursor();
      const next = _.once(this.next());

      stream.on('error', next);
      stream.on('end', next);
      stream.on('data', handleSuggestion);
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
        'category',
        'productFamily',
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
      category: {},
      productFamily: {},
      confirmer: {},
      owner: {}
    };
  }

  function handleSuggestion(s)
  {
    const totals = results.totals;
    const groupKey = util.createGroupKey(options.interval, s[groupProperty], false);
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

    inc('type', 'suggestion');

    if (s.status !== 'new' && s.status !== 'cancelled')
    {
      inc('type', 'kaizen');
    }

    inc('status');
    inc('section');
    inc('category', s.categories);
    inc('productFamily');

    const confirmer = s.confirmer;

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

    incOwners('suggestion', s.suggestionOwners);
    incOwners('kaizen', s.kaizenOwners);

    function inc(metricProperty, metricKey)
    {
      if (metricKey === undefined)
      {
        metricKey = s[metricProperty];
      }

      if (!metricKey)
      {
        return;
      }

      if (Array.isArray(metricKey))
      {
        _.forEach(metricKey, incMetric);
      }
      else
      {
        incMetric(metricKey);
      }

      function incMetric(key)
      {
        if (!totals[metricProperty][key])
        {
          totals[metricProperty][key] = 1;
        }
        else
        {
          totals[metricProperty][key] += 1;
        }

        if (!group[metricProperty][key])
        {
          group[metricProperty][key] = 1;
        }
        else
        {
          group[metricProperty][key] += 1;
        }
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
