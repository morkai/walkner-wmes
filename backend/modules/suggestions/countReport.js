// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  var Suggestion = mongoose.model('Suggestion');

  var groupProperty = 'date';
  var minGroupKey = Number.MAX_VALUE;
  var maxGroupKey = Number.MIN_VALUE;
  var results = {
    options: options,
    users: {},
    totals: createGroup(),
    groups: {}
  };

  step(
    function findSuggestionsStep()
    {
      var conditions = {};
      var sort = {};

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

      var stream = Suggestion.find(conditions, {changes: 0}).sort(sort).lean().cursor();
      var next = _.once(this.next());

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

      var createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      var groupKey = minGroupKey;
      var groups = [];

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
    var totals = results.totals;
    var groupKey = util.createGroupKey(options.interval, s[groupProperty], false);
    var group = results.groups[groupKey];

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

    var confirmer = s.confirmer;

    if (confirmer)
    {
      results.users[confirmer.id] = confirmer.label;

      if (!totals.confirmer[confirmer.id])
      {
        totals.confirmer[confirmer.id] = 0;
      }

      totals.confirmer[confirmer.id] += 1;

      if (!group.confirmer[confirmer.id])
      {
        group.confirmer[confirmer.id] = 0;
      }

      group.confirmer[confirmer.id] += 1;
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
      var totalsByOwner = totals.owner;
      var groupByOwner = group.owner;

      _.forEach(owners, function(owner)
      {
        results.users[owner.id] = owner.label;

        if (!totalsByOwner[owner.id])
        {
          totalsByOwner[owner.id] = {total: 0};
        }

        totalsByOwner[owner.id].total += 1;
        totalsByOwner[owner.id][type] = (totalsByOwner[owner.id][type] || 0) + 1;

        if (!groupByOwner[owner.id])
        {
          groupByOwner[owner.id] = {total: 0};
        }

        groupByOwner[owner.id].total += 1;
        groupByOwner[owner.id][type] = (groupByOwner[owner.id][type] || 0) + 1;
      });
    }
  }

  function sortTotals(property)
  {
    var totals = [];

    _.forEach(results.totals[property], function(value, key)
    {
      totals.push([key, value]);
    });

    results.totals[property] = totals.sort(function(a, b) { return b[1] - a[1]; });
  }

  function sortOwnerTotals()
  {
    var totals = [];

    _.forEach(results.totals.owner, function(values, key)
    {
      totals.push([key, values.total, values.nearMiss || 0, values.suggestion || 0, values.kaizen || 0]);
    });

    results.totals.owner = totals.sort(function(a, b) { return b[1] - a[1]; });
  }
};
