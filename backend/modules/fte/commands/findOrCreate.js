// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var step = require('h5.step');
var canManage = require('../canManage');

module.exports = function findOrCreateFteEntry(app, fteModule, FteEntry, socket, data, reply)
{
  var userModule = app[fteModule.config.userId];
  var subdivisionsModule = app[fteModule.config.subdivisionsId];
  var settings = app[fteModule.config.settingsId];

  if (!_.isFunction(reply))
  {
    reply = function() {};
  }

  var user = socket.handshake.user;

  if (!canManage(user, FteEntry))
  {
    return reply(new Error('AUTH'));
  }

  if (!_.isObject(data))
  {
    return reply(new Error('INPUT'));
  }

  var shiftMoment = moment(data.date);
  var subdivision = subdivisionsModule.modelsById[data.subdivision];

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

  var condition = {
    subdivision: subdivision._id,
    date: shiftMoment.toDate()
  };

  step(
    function findStructureSettingStep()
    {
      settings.findById('fte.structure.' + subdivision._id, this.next());
    },
    function handleStructureSettingResultStep(err, structureSetting)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (_.isEmpty(structureSetting))
      {
        return this.skip(new Error('STRUCTURE'));
      }

      this.structure = structureSetting.value;
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
          canManage(user, fteEntry) ? null : new Error('AUTH'),
          fteEntry
        );
      }
    },
    function createFteEntryStep()
    {
      var creator = userModule.createUserInfo(user, socket);
      var options = {
        subdivision: condition.subdivision,
        subdivisionType: subdivision.type,
        date: condition.date,
        shift: data.shift,
        copy: !!data.copy,
        structure: this.structure
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
