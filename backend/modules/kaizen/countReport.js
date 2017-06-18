// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  var KaizenOrder = mongoose.model('KaizenOrder');

  var groupProperty = 'eventDate';
  var minGroupKey = Number.MAX_VALUE;
  var maxGroupKey = Number.MIN_VALUE;
  var results = {
    options: options,
    users: {},
    totals: createGroup(),
    groups: {}
  };

  step(
    function findKaizenOrdersStep()
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

      var stream = KaizenOrder.find(conditions, {changes: 0}).sort(sort).lean().cursor();
      var next = _.once(this.next());

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
    var totals = results.totals;
    var groupKey = util.createGroupKey(options.interval, ko[groupProperty], false);
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

    _.forEach(ko.types, function(type) { inc('type', type); });

    inc('status');
    inc('section');
    inc('area');
    inc('cause');
    inc('risk');
    inc('behaviour');
    inc('nearMissCategory');
    inc('suggestionCategory');

    var confirmer = ko.confirmer;

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
