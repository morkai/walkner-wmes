// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var moment = require('moment');
var canManage = require('../canManage');

module.exports = function(app, fteModule, FteEntry, socket, data, reply)
{
  var userModule = app[fteModule.config.userId];
  var subdivisionsModule = app[fteModule.config.subdivisionsId];

  if (!lodash.isFunction(reply))
  {
    reply = function() {};
  }

  var user = socket.handshake.user;

  if (!canManage(user, FteEntry))
  {
    return reply(new Error('AUTH'));
  }

  if (!lodash.isObject(data))
  {
    return reply(new Error('INPUT'));
  }

  var shiftMoment = moment(data.date);
  var validSubdivision = subdivisionsModule.models.some(function(subdivision)
  {
    return subdivision._id.toString() === data.subdivision;
  });

  if (!shiftMoment.isValid()
    || !validSubdivision
    || !lodash.isNumber(data.shift))
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
    subdivision: data.subdivision,
    date: shiftMoment.toDate(),
    shift: data.shift
  };

  FteEntry.findOne(condition).lean().exec(function(err, fteEntry)
  {
    if (err)
    {
      return reply(err);
    }

    if (fteEntry !== null)
    {
      return reply(
        canManage(user, fteEntry) ? null : new Error('AUTH'),
        fteEntry._id.toString()
      );
    }

    var creator = userModule.createUserInfo(user, socket);

    FteEntry.createForShift(condition, creator, function(err, fteEntry)
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
    });
  });
};
