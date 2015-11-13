// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  var Suggestion = mongoose.model('Suggestion');

  var minGroupKey = Number.MAX_VALUE;
  var maxGroupKey = Number.MIN_VALUE;
  var results = {
    options: options,
    users: {},
    suggestionOwners: {},
    kaizenOwners: {},
    groups: {}
  };

  step(
    function findSuggestionsStep()
    {
      var conditions = {};

      if (options.fromTime)
      {
        conditions.date = {$gte: new Date(options.fromTime)};
      }

      if (options.toTime)
      {
        if (!conditions.date)
        {
          conditions.date = {};
        }

        conditions.date.$lt = new Date(options.toTime);
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

      var stream = Suggestion.find(conditions, {changes: 0}).lean().stream();
      var next = this.next();

      stream.on('error', next);
      stream.on('close', next);
      stream.on('data', handleSuggestion);
    },
    function finalizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      var createNextGroupKey = util.createCreateNextGroupKey('week');
      var groupKey = minGroupKey;
      var groups = [];

      while (groupKey <= maxGroupKey)
      {
        var group = results.groups[groupKey] || createGroup(groupKey);

        group.averageDuration = util.round(group.averageDuration / (group.count.open + group.count.finished));

        groups.push(group);

        groupKey = createNextGroupKey(groupKey);
      }

      results.groups = groups;
      results.suggestionOwners = sortOwners(results.suggestionOwners);
      results.kaizenOwners = sortOwners(results.kaizenOwners);

      return setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      return done(err, results);
    }
  );

  function handleSuggestion(s)
  {
    var groupKey = util.createGroupKey('week', s.date, false);
    var group = results.groups[groupKey];

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

    var cancelled = s.status === 'cancelled';
    var statusProperty = cancelled ? 'cancelled' : s.status === 'finished' ? 'finished' : 'open' ;

    _.forEach(s.suggestionOwners, incOwner.bind(null, 'suggestionOwners', statusProperty));

    if (!cancelled && s.status !== 'new')
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
    results.users[owner.id] = owner.label;

    if (!results[ownersProperty][owner.id])
    {
      results[ownersProperty][owner.id] = {
        open: 0,
        finished: 0,
        cancelled: 0
      };
    }

    results[ownersProperty][owner.id][statusProperty] += 1;
  }

  function sortOwners(unsorted)
  {
    var sorted = [];

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
