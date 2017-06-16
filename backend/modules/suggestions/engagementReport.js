// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  var KaizenOrder = mongoose.model('KaizenOrder');
  var Suggestion = mongoose.model('Suggestion');
  var KaizenSection = mongoose.model('KaizenSection');

  var results = {
    options: options,
    sections: {},
    users: {},
    groups: {}
  };

  step(
    function findStep()
    {
      findSections(this.parallel());
      countNearMisses(options, _.once(this.parallel()));
      countSuggestions(options, _.once(this.parallel()));
    },
    function finalizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      return setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      return done(err, results);
    }
  );

  function findSections(done)
  {
    KaizenSection.find().lean().exec(function(err, sections)
    {
      if (err)
      {
        return done(err);
      }

      _.forEach(sections, function(section)
      {
        results.sections[section._id] = section.name;
      });

      done();
    });
  }

  function countNearMisses(options, done)
  {
    var conditions = {
      types: 'nearMiss'
    };

    if (Array.isArray(options.status) && !_.isEmpty(options.status))
    {
      conditions.status = {$in: options.status};
    }

    if (Array.isArray(options.sections) && !_.isEmpty(options.sections))
    {
      conditions.section = {$in: options.sections};
    }

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

    var stream = KaizenOrder.find(conditions, {eventDate: 1, nearMissOwners: 1, section: 1}).lean().cursor();

    stream.on('error', done);
    stream.on('end', done);
    stream.on('data', handleNearMiss);
  }

  function countSuggestions(options, done)
  {
    var conditions = {
      categories: 'BHP'
    };

    if (Array.isArray(options.status) && !_.isEmpty(options.status))
    {
      conditions.status = {$in: options.status};
    }

    if (Array.isArray(options.sections) && !_.isEmpty(options.sections))
    {
      conditions.section = {$in: options.sections};
    }

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

    var stream = Suggestion.find(conditions, {date: 1, owners: 1, section: 1}).lean().cursor();

    stream.on('error', done);
    stream.on('end', done);
    stream.on('data', handleSuggestion);
  }

  function handleNearMiss(doc)
  {
    _.forEach(doc.nearMissOwners, function(owner)
    {
      getGroup(util.createGroupKey(options.interval, doc.eventDate, false), owner, doc.section).nearMisses += 1;
    });
  }

  function handleSuggestion(doc)
  {
    _.forEach(doc.owners, function(owner)
    {
      getGroup(util.createGroupKey(options.interval, doc.date, false), owner, doc.section).suggestions += 1;
    });
  }

  function getGroup(key, owner, section)
  {
    var group = results.groups[key];

    if (!group)
    {
      group = results.groups[key] = {};
    }

    var user = owner.label.replace(/[^A-Za-z]+/g, '').toLowerCase();

    if (!results.users[user])
    {
      results.users[user] = owner.label;
    }

    if (!group[user])
    {
      group[user] = {
        nearMisses: 0,
        suggestions: 0,
        sections: {}
      };
    }

    if (!group[user].sections[section])
    {
      group[user].sections[section] = 0;
    }

    group[user].sections[section] += 1;

    return group[user];
  }
};
