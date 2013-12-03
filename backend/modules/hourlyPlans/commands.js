'use strict';

var lodash = require('lodash');

module.exports = function setUpHourlyPlansCommands(app, hourlyPlansModule)
{
  var mongoose = app[hourlyPlansModule.config.mongooseId];
  var divisions = app[hourlyPlansModule.config.divisionsId];
  var fteModule = app[hourlyPlansModule.config.fteId];
  var HourlyPlan = mongoose.model('HourlyPlan');
  
  app[hourlyPlansModule.config.sioId].sockets.on('connection', function(socket)
  {
    socket.on('hourlyPlans.getCurrentEntryId', getCurrentEntryId.bind(null, socket));
    socket.on('hourlyPlans.updateCount', updateCount.bind(null, socket));
    socket.on('hourlyPlans.updatePlan', updatePlan.bind(null, socket));
    socket.on('hourlyPlans.lockEntry', lockEntry.bind(null, socket));
  });

  function canManage(user)
  {
    return user.super
      || (Array.isArray(user.privileges)
        && user.privileges.indexOf('HOURLY_PLANS:MANAGE') !== -1);
  }

  function getCurrentEntryId(socket, divisionId, reply)
  {
    if (!lodash.isFunction(reply))
    {
      reply = function() {};
    }

    var user = socket.handshake.user;

    if (!canManage(user))
    {
      return reply(new Error('AUTH'));
    }

    var validDivision = divisions.models.some(function(division)
    {
      return division.get('_id').toString() === divisionId;
    });

    if (!validDivision)
    {
      return reply(new Error('INPUT'));
    }

    var currentShift = fteModule.getCurrentShift();
    var condition = {
      division: divisionId,
      date: currentShift.date,
      shift: currentShift.no
    };
    var fields = {_id: 1, locked: 1};

    HourlyPlan.findOne(condition, fields).lean().exec(function(err, hourlyPlan)
    {
      if (err)
      {
        return reply(err);
      }

      if (hourlyPlan !== null)
      {
        return reply(
          hourlyPlan.locked ? new Error('LOCKED') : null,
          hourlyPlan._id.toString()
        );
      }

      currentShift.division = divisionId;

      HourlyPlan.createForShift(currentShift, user, function(err, hourlyPlan)
      {
        if (hourlyPlan)
        {
          app.broker.publish('hourlyPlan.created', {
            user: user,
            model: {
              _id: hourlyPlan.get('_id'),
              division: currentShift.division,
              date: currentShift.date,
              shift: currentShift.no
            }
          });
        }

        return reply(err, hourlyPlan ? hourlyPlan._id.toString() : null);
      });
    });
  }

  function updateCount(socket, data, reply)
  {
    if (!lodash.isFunction(reply))
    {
      reply = function() {};
    }

    if (!lodash.isString(data._id)
      || !lodash.isNumber(data.flowIndex)
      || !lodash.isNumber(data.newValue))
    {
      return reply(new Error('INVALID_INPUT'));
    }

    var user = socket.handshake.user;

    if (!canManage(user))
    {
      return reply(new Error('AUTH'));
    }

    var condition = {_id: data._id};
    var fields = {locked: 1};

    HourlyPlan.findOne(condition, fields).exec(function(err, hourlyPlan)
    {
      if (err)
      {
        return reply(err);
      }

      if (hourlyPlan === null)
      {
        return reply(new Error('UNKNOWN_ENTRY'));
      }

      if (hourlyPlan.get('locked'))
      {
        return reply(new Error('ENTRY_LOCKED'));
      }

      var update = {$set: {
        updatedAt: new Date(),
        updater: user._id,
        updaterLabel: user.login
      }};
      var field = 'flows.' + data.flowIndex;
console.log(data);
      if (lodash.isNumber(data.hourIndex))
      {
        field += '.hours.' + data.hourIndex;
      }
      else
      {
        field += '.level';
      }

      update.$set[field] = data.newValue;

      HourlyPlan.update(condition, update, function(err, updatedCount)
      {
        if (err)
        {
          return reply(err);
        }

        if (updatedCount !== 1)
        {
          return reply(new Error('UNKNOWN_ENTRY'));
        }

        reply();

        app.pubsub.publish('hourlyPlans.updated.' + data._id, data);
      });
    });
  }

  function updatePlan(socket, data, reply)
  {
    if (!lodash.isFunction(reply))
    {
      reply = function() {};
    }

    if (!lodash.isString(data._id)
      || !lodash.isBoolean(data.newValue)
      || !lodash.isNumber(data.flowIndex))
    {
      return reply(new Error('INVALID_INPUT'));
    }

    var user = socket.handshake.user;

    if (!canManage(user))
    {
      return reply(new Error('AUTH'));
    }

    var condition = {_id: data._id};
    var fields = {locked: 1};

    HourlyPlan.findOne(condition, fields).exec(function(err, hourlyPlan)
    {
      if (err)
      {
        return reply(err);
      }

      if (hourlyPlan === null)
      {
        return reply(new Error('UNKNOWN_ENTRY'));
      }

      if (hourlyPlan.get('locked'))
      {
        return reply(new Error('ENTRY_LOCKED'));
      }

      var update = {$set: {
        updatedAt: new Date(),
        updater: user._id,
        updaterLabel: user.login
      }};

      update.$set['flows.' + data.flowIndex + '.noPlan'] = data.newValue;

      HourlyPlan.update(condition, update, function(err, updatedCount)
      {
        if (err)
        {
          return reply(err);
        }

        if (updatedCount !== 1)
        {
          return reply(new Error('UNKNOWN_ENTRY'));
        }

        reply();

        app.pubsub.publish('hourlyPlans.updated.' + data._id, data);
      });
    });
  }

  function lockEntry(socket, hourlyPlanId, reply)
  {
    if (!lodash.isFunction(reply))
    {
      reply = function() {};
    }

    var user = socket.handshake.user;

    if (!canManage(user))
    {
      return reply(new Error('AUTH'));
    }

    HourlyPlan.lock(hourlyPlanId, user, function(err)
    {
      if (err)
      {
        return reply(err);
      }

      reply();

      app.pubsub.publish('hourlyPlans.locked.' + hourlyPlanId);
    });
  }
};
