// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');
const canManage = require('../canManage');

module.exports = function findOrCreateFteEntry(app, fteModule, FteEntry, entryType, socket, data, reply)
{
  const userModule = app[fteModule.config.userId];
  const subdivisionsModule = app[fteModule.config.subdivisionsId];
  const settings = app[fteModule.config.settingsId];

  if (!_.isFunction(reply))
  {
    reply = function() {};
  }

  const user = socket.handshake.user;

  if (!canManage(user, FteEntry, entryType))
  {
    return reply(new Error('AUTH'));
  }

  if (!_.isObject(data))
  {
    return reply(new Error('INPUT'));
  }

  const shiftMoment = moment(data.date);
  const subdivision = subdivisionsModule.modelsById[data.subdivision];

  if (!shiftMoment.isValid()
    || !subdivision
    || !_.isNumber(data.shift))
  {
    return reply(new Error('INPUT'));
  }

  shiftMoment.hours(0).minutes(0).seconds(0).milliseconds(0);

  if (shiftMoment.valueOf() > moment().hours(0).minutes(0).seconds(0).milliseconds(0).valueOf())
  {
    return reply(new Error('INPUT'));
  }

  if (data.shift === 3)
  {
    shiftMoment.hours(22);
  }
  else if (data.shift === 2)
  {
    shiftMoment.hours(14);
  }
  else
  {
    data.shift = 1;

    shiftMoment.hours(6);
  }

  const condition = {
    subdivision: subdivision._id,
    date: shiftMoment.toDate()
  };

  step(
    function findStructureSettingStep()
    {
      const conditions = {
        _id: [
          `fte.structure.${subdivision._id}`,
          'fte.absenceTasks'
        ]
      };

      settings.findValues(conditions, 'fte.', this.next());
    },
    function handleStructureSettingResultStep(err, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      const structure = settings[`structure.${subdivision._id}`];

      if (_.isEmpty(structure))
      {
        return this.skip(new Error('STRUCTURE'));
      }

      this.settings = {
        structure,
        absenceTasks: {}
      };

      _.forEach(settings.absenceTasks, id => this.settings.absenceTasks[id] = true);
    },
    function findFteEntryStep()
    {
      FteEntry.findOne(condition).lean().exec(this.next());
    },
    function handleFindFteEntryStep(err, fteEntry)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (fteEntry)
      {
        return this.skip(
          canManage(user, fteEntry, entryType) ? null : new Error('AUTH'),
          fteEntry
        );
      }
    },
    function createFteEntryStep()
    {
      const creator = userModule.createUserInfo(user, socket);
      const options = {
        subdivision: condition.subdivision,
        subdivisionType: subdivision.type,
        date: condition.date,
        shift: data.shift,
        copy: !!data.copy,
        structure: this.settings.structure,
        absenceTasks: this.settings.absenceTasks
      };

      FteEntry.createForShift(options, creator, this.next());
    },
    function sendResultStep(err, fteEntry)
    {
      if (fteEntry)
      {
        app.broker.publish(FteEntry.TOPIC_PREFIX + '.created', {
          user: user,
          model: {
            _id: fteEntry._id,
            subdivision: condition.subdivision,
            date: condition.date,
            shift: condition.shift
          }
        });
      }

      return reply(err, fteEntry ? fteEntry._id.toString() : null);
    }
  );
};
