// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const KaizenOrder = mongoose.model('KaizenOrder');
  const Suggestion = mongoose.model('Suggestion');
  const BehaviorObsCard = mongoose.model('BehaviorObsCard');
  const MinutesForSafetyCard = mongoose.model('MinutesForSafetyCard');
  const KaizenSection = mongoose.model('KaizenSection');
  const FteMasterEntry = mongoose.model('FteMasterEntry');
  const FteLeaderEntry = mongoose.model('FteLeaderEntry');

  const results = {
    options: options,
    sections: {},
    totals: createEmptyGroup(),
    bySection: {}
  };
  const totals = results.totals;
  const subdivisionToSections = {};

  step(
    function findStep()
    {
      findSections(this.group());
    },
    function countStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      countFte(FteMasterEntry, '$total', options, this.group());
      countFte(FteLeaderEntry, '$totals.overall', options, this.group());
      countNearMisses(options, this.group());
      countSuggestions(options, this.group());
      countBehaviorObsCards(options, this.group());
      countMinutesForSafetyCards(options, this.group());
    },
    function finalizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      totals.fte.avg = 0;

      Object.keys(results.bySection).forEach(section =>
      {
        finalizeGroup(results.bySection[section]);

        totals.fte.avg += results.bySection[section].fte.avg;
      });

      finalizeGroup(totals);

      setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      return done(err, results);
    }
  );

  function createEmptyGroup()
  {
    return {
      ipr: 0,
      ips: 0,
      ipc: 0,
      nearMissCount: 0,
      suggestionCount: 0,
      observationCount: 0,
      minutesCount: 0,
      userCount: new Set(),
      fte: {
        avg: -1,
        total: 0,
        days: new Set()
      }
    };
  }

  function getGroup(section)
  {
    if (!results.bySection[section])
    {
      results.bySection[section] = createEmptyGroup();
    }

    return results.bySection[section];
  }

  function finalizeGroup(group)
  {
    group.userCount = group.userCount.size;
    group.fte.days = group.fte.days.size;

    if (group.fte.avg === -1)
    {
      group.fte.avg = util.round(group.fte.total / group.fte.days);
    }

    group.fte.total = util.round(group.fte.total);
    group.ipr = util.round((group.nearMissCount + group.suggestionCount + group.observationCount) / group.fte.avg);
    group.ips = util.round(
      group.observationCount / (group.nearMissCount + group.suggestionCount + group.observationCount) * 100
    );
    group.ipc = Math.min(100, util.round(group.userCount / group.fte.avg * 100));
  }

  function findSections(done)
  {
    KaizenSection.find().lean().exec((err, sections) =>
    {
      if (err)
      {
        return done(err);
      }

      sections.forEach(section =>
      {
        results.sections[section._id] = section.name;

        if (!Array.isArray(section.subdivisions)
          || !section.subdivisions.length
          || (options.sections.length && !options.sections.includes(section._id)))
        {
          return;
        }

        section.subdivisions.forEach(subdivision =>
        {
          if (!subdivisionToSections[subdivision])
          {
            subdivisionToSections[subdivision] = [];
          }

          subdivisionToSections[subdivision].push(section._id);
        });
      });

      done();
    });
  }

  function countFte(Model, totalProperty, options, done)
  {
    const conditions = {
      subdivision: {
        $in: Object.keys(subdivisionToSections).map(id => new mongoose.Types.ObjectId(id))
      }
    };

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

    const pipeline = [
      {$match: conditions},
      {$group: {
        _id: {
          subdivision: '$subdivision',
          y: {$year: '$date'},
          m: {$month: '$date'},
          d: {$dayOfMonth: '$date'}
        },
        total: {$sum: totalProperty}
      }}
    ];

    Model.aggregate(pipeline, (err, results) =>
    {
      if (err)
      {
        return done(err);
      }

      results.forEach(result =>
      {
        const date = `${result._id.y}-${result._id.m}-${result._id.d}`;

        totals.fte.total += result.total;
        totals.fte.days.add(date);

        subdivisionToSections[result._id.subdivision].forEach(sectionId =>
        {
          const group = getGroup(sectionId);

          group.fte.total += result.total;
          group.fte.days.add(date);
        });
      });

      done();
    });
  }

  function countNearMisses(options, done)
  {
    const conditions = {
      types: 'nearMiss'
    };

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

    const pipeline = [
      {$match: conditions},
      {$group: {
        _id: '$section',
        count: {$sum: 1},
        users: {$addToSet: '$nearMissOwners.id'}
      }}
    ];

    KaizenOrder.aggregate(pipeline, (err, results) =>
    {
      if (err)
      {
        return done(err);
      }

      results.forEach(result =>
      {
        const group = getGroup(result._id);

        totals.nearMissCount += result.count;
        group.nearMissCount += result.count;

        result.users.forEach(userIds =>
        {
          userIds.forEach(userId =>
          {
            totals.userCount.add(userId);
            group.userCount.add(userId);
          });
        });
      });

      done();
    });
  }

  function countSuggestions(options, done)
  {
    const conditions = {
      categories: 'BHP'
    };

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

    const pipeline = [
      {$match: conditions},
      {$group: {
        _id: '$section',
        count: {$sum: 1},
        users: {$addToSet: '$owners.id'}
      }}
    ];

    Suggestion.aggregate(pipeline, (err, results) =>
    {
      if (err)
      {
        return done(err);
      }

      results.forEach(result =>
      {
        const group = getGroup(result._id);

        totals.suggestionCount += result.count;
        group.suggestionCount += result.count;

        result.users.forEach(userIds =>
        {
          userIds.forEach(userId =>
          {
            totals.userCount.add(userId);
            group.userCount.add(userId);
          });
        });
      });

      done();
    });
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

    const pipeline = [
      {$match: conditions},
      {$group: {
        _id: '$section',
        count: {$sum: 1},
        users: {$addToSet: '$observer.id'}
      }}
    ];

    BehaviorObsCard.aggregate(pipeline, (err, results) =>
    {
      if (err)
      {
        return done(err);
      }

      results.forEach(result =>
      {
        const group = getGroup(result._id);

        totals.observationCount += result.count;
        group.observationCount += result.count;

        result.users.forEach(userId =>
        {
          totals.userCount.add(userId);
          group.userCount.add(userId);
        });
      });

      done();
    });
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

    const pipeline = [
      {$match: conditions},
      {$unwind: '$participants'},
      {$group: {
        _id: '$section',
        count: {$addToSet: '$_id'},
        owners: {$addToSet: '$owner.id'},
        participants: {$addToSet: '$participants.id'}
      }},
      {$project: {
        _id: '$_id',
        count: {$size: '$count'},
        owners: '$owners',
        participants: '$participants'
      }}
    ];

    MinutesForSafetyCard.aggregate(pipeline, (err, results) =>
    {
      if (err)
      {
        return done(err);
      }

      results.forEach(result =>
      {
        const group = getGroup(result._id);

        totals.minutesCount += result.count;
        group.minutesCount += result.count;

        result.owners.forEach(userId =>
        {
          totals.userCount.add(userId);
          group.userCount.add(userId);
        });

        result.participants.forEach(userId =>
        {
          totals.userCount.add(userId);
          group.userCount.add(userId);
        });
      });

      done();
    });
  }
};
