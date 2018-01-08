// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const User = mongoose.model('User');
  const KaizenOrder = mongoose.model('KaizenOrder');
  const Suggestion = mongoose.model('Suggestion');
  const BehaviorObsCard = mongoose.model('BehaviorObsCard');
  const MinutesForSafetyCard = mongoose.model('MinutesForSafetyCard');
  const KaizenSection = mongoose.model('KaizenSection');

  const results = {
    options: options,
    sections: {},
    users: {},
    groups: {}
  };

  step(
    function findStep()
    {
      findSections(this.group());
      countNearMisses(options, _.once(this.group()));
      countSuggestions(options, _.once(this.group()));
      countBehaviorObsCards(options, _.once(this.group()));
      countMinutesForSafetyCards(options, _.once(this.group()));
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
    const conditions = {
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

    const stream = KaizenOrder.find(conditions, {eventDate: 1, nearMissOwners: 1, section: 1}).lean().cursor();

    stream.on('error', done);
    stream.on('end', done);
    stream.on('data', handleNearMiss);
  }

  function countSuggestions(options, done)
  {
    const conditions = {
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

    const stream = Suggestion.find(conditions, {date: 1, owners: 1, section: 1}).lean().cursor();

    stream.on('error', done);
    stream.on('end', done);
    stream.on('data', handleSuggestion);
  }

  function countBehaviorObsCards(options, done)
  {
    const conditions = {};

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

    const stream = BehaviorObsCard.find(conditions, {date: 1, observer: 1, section: 1}).lean().cursor();

    stream.on('error', done);
    stream.on('end', done);
    stream.on('data', handleBehaviorObsCard);
  }

  function countMinutesForSafetyCards(options, done)
  {
    const conditions = {};

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

    const fields = {
      date: 1,
      owner: 1,
      section: 1,
      participants: 1
    };

    const stream = MinutesForSafetyCard.find(conditions, fields).lean().cursor();

    stream.on('error', done);
    stream.on('end', done);
    stream.on('data', handleMinutesForSafetyCard);
  }

  function handleNearMiss(doc)
  {
    const groupKey = util.createGroupKey(options.interval, doc.eventDate, false);

    _.forEach(doc.nearMissOwners, owner =>
    {
      getGroup(groupKey, owner, doc.section).nearMisses += 1;
    });
  }

  function handleSuggestion(doc)
  {
    const groupKey = util.createGroupKey(options.interval, doc.date, false);

    _.forEach(doc.owners, function(owner)
    {
      getGroup(groupKey, owner, doc.section).suggestions += 1;
    });
  }

  function handleBehaviorObsCard(doc)
  {
    getGroup(util.createGroupKey(options.interval, doc.date, false), doc.observer, doc.section).behaviorObs += 1;
  }

  function handleMinutesForSafetyCard(doc)
  {
    const groupKey = util.createGroupKey(options.interval, doc.date, false);

    getGroup(groupKey, doc.owner, doc.section).minutesForSafety += 1;

    _.forEach(doc.participants, participant =>
    {
      getGroup(groupKey, participant, doc.section).minutesForSafety += 1;
    });
  }

  function getGroup(key, owner, section)
  {
    let group = results.groups[key];

    if (!group)
    {
      group = results.groups[key] = {};
    }

    const user = User.transliterateName(owner.label);

    if (!results.users[user])
    {
      results.users[user] = owner.label;
    }

    if (!group[user])
    {
      group[user] = {
        nearMisses: 0,
        suggestions: 0,
        behaviorObs: 0,
        minutesForSafety: 0,
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
