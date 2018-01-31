// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
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
    bySection: {},
    byInterval: {}
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

      countFte(FteMasterEntry, options, this.group());
      countFte(FteLeaderEntry, options, this.group());
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

      if (options.interval !== 'none')
      {
        const groupKeys = Object.keys(results.byInterval).sort().map(Number);
        const lastGroupKey = _.last(groupKeys);
        const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
        const groups = [];
        let groupKey = groupKeys[0];

        while (groupKey <= lastGroupKey)
        {
          const group = getIntervalGroup(groupKey);

          finalizeGroup(group);

          _.forEach(group.bySection, finalizeGroup);

          groups.push(group);

          groupKey = createNextGroupKey(groupKey);
        }

        results.byInterval = groups;
      }
      else
      {
        results.byInterval = null;
      }

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

  function getSectionGroup(section)
  {
    if (!results.bySection[section])
    {
      results.bySection[section] = createEmptyGroup();
    }

    return results.bySection[section];
  }

  function getIntervalGroup(date, section)
  {
    const key = util.createGroupKey(options.interval, date, false);

    if (!results.byInterval[key])
    {
      results.byInterval[key] = Object.assign(createEmptyGroup(), {key, bySection: {}});
    }

    if (section && !results.byInterval[key].bySection[section])
    {
      results.byInterval[key].bySection[section] = createEmptyGroup();
    }

    return results.byInterval[key];
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

  function countFte(Model, options, done)
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
        total: {$sum: '$totals.supply.total'}
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
        const day = `${result._id.y}-${result._id.m}-${result._id.d}`;
        const date = moment(day, 'YYYY-MM-DD').toDate();

        totals.fte.total += result.total;
        totals.fte.days.add(day);

        subdivisionToSections[result._id.subdivision].forEach(sectionId =>
        {
          const sectionGroup = getSectionGroup(sectionId);
          const intervalGroup = getIntervalGroup(date, sectionId);

          sectionGroup.fte.total += result.total;
          sectionGroup.fte.days.add(day);

          intervalGroup.fte.total += result.total;
          intervalGroup.fte.days.add(day);

          intervalGroup.bySection[sectionId].fte.total += result.total;
          intervalGroup.bySection[sectionId].fte.days.add(day);
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

    const cursor = KaizenOrder
      .find(conditions, {eventDate: 1, section: 1, 'nearMissOwners.id': 1})
      .lean()
      .cursor();
    const finalize = _.once(done);

    cursor.on('error', finalize);
    cursor.on('end', finalize);
    cursor.on('data', kaizenOrder =>
    {
      const sectionGroup = getSectionGroup(kaizenOrder.section);
      const intervalGroup = getIntervalGroup(kaizenOrder.eventDate, kaizenOrder.section);

      totals.nearMissCount += 1;
      sectionGroup.nearMissCount += 1;
      intervalGroup.nearMissCount += 1;
      intervalGroup.bySection[kaizenOrder.section].nearMissCount += 1;

      kaizenOrder.nearMissOwners.forEach(owner =>
      {
        totals.userCount.add(owner.id);
        sectionGroup.userCount.add(owner.id);
        intervalGroup.userCount.add(owner.id);
        intervalGroup.bySection[kaizenOrder.section].userCount.add(owner.id);
      });
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

    const cursor = Suggestion
      .find(conditions, {date: 1, section: 1, 'owners.id': 1})
      .lean()
      .cursor();
    const finalize = _.once(done);

    cursor.on('error', finalize);
    cursor.on('end', finalize);
    cursor.on('data', suggestion =>
    {
      const sectionGroup = getSectionGroup(suggestion.section);
      const intervalGroup = getIntervalGroup(suggestion.date, suggestion.section);

      totals.suggestionCount += 1;
      sectionGroup.suggestionCount += 1;
      intervalGroup.suggestionCount += 1;
      intervalGroup.bySection[suggestion.section].suggestionCount += 1;

      suggestion.owners.forEach(owner =>
      {
        totals.userCount.add(owner.id);
        sectionGroup.userCount.add(owner.id);
        intervalGroup.userCount.add(owner.id);
        intervalGroup.bySection[suggestion.section].userCount.add(owner.id);
      });
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

    const cursor = BehaviorObsCard
      .find(conditions, {date: 1, section: 1, 'observer.id': 1})
      .lean()
      .cursor();
    const finalize = _.once(done);

    cursor.on('error', finalize);
    cursor.on('end', finalize);
    cursor.on('data', behaviorObsCard =>
    {
      const sectionGroup = getSectionGroup(behaviorObsCard.section);
      const intervalGroup = getIntervalGroup(behaviorObsCard.date, behaviorObsCard.section);

      totals.observationCount += 1;
      sectionGroup.observationCount += 1;
      intervalGroup.observationCount += 1;
      intervalGroup.bySection[behaviorObsCard.section].observationCount += 1;

      totals.userCount.add(behaviorObsCard.observer.id);
      sectionGroup.userCount.add(behaviorObsCard.observer.id);
      intervalGroup.userCount.add(behaviorObsCard.observer.id);
      intervalGroup.bySection[behaviorObsCard.section].userCount.add(behaviorObsCard.observer.id);
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

    const cursor = MinutesForSafetyCard
      .find(conditions, {date: 1, section: 1, 'owner.id': 1, 'participants.id': 1})
      .lean()
      .cursor();
    const finalize = _.once(done);

    cursor.on('error', finalize);
    cursor.on('end', finalize);
    cursor.on('data', minutesForSafetyCard =>
    {
      const sectionGroup = getSectionGroup(minutesForSafetyCard.section);
      const intervalGroup = getIntervalGroup(minutesForSafetyCard.date, minutesForSafetyCard.section);

      totals.minutesCount += 1;
      sectionGroup.minutesCount += 1;
      intervalGroup.minutesCount += 1;
      intervalGroup.bySection[minutesForSafetyCard.section].minutesCount += 1;

      if (minutesForSafetyCard.owner)
      {
        totals.userCount.add(minutesForSafetyCard.owner.id);
        sectionGroup.userCount.add(minutesForSafetyCard.owner.id);
        intervalGroup.userCount.add(minutesForSafetyCard.owner.id);
        intervalGroup.bySection[minutesForSafetyCard.section].userCount.add(minutesForSafetyCard.owner.id);
      }

      minutesForSafetyCard.participants.forEach(participant =>
      {
        totals.userCount.add(participant.id);
        sectionGroup.userCount.add(participant.id);
        intervalGroup.userCount.add(participant.id);
        intervalGroup.bySection[minutesForSafetyCard.section].userCount.add(participant.id);
      });
    });
  }
};
