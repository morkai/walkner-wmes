'use strict';

var moment = require('moment');
var lodash = require('lodash');
var userInfo = require('../../models/userInfo');
var canManage = require('./canManage');

module.exports = function setUpHourlyPlansCommands(app, hourlyPlansModule)
{
  var mongoose = app[hourlyPlansModule.config.mongooseId];
  var divisions = app[hourlyPlansModule.config.divisionsId];
  var HourlyPlan = mongoose.model('HourlyPlan');
  
  app[hourlyPlansModule.config.sioId].sockets.on('connection', function(socket)
  {
    socket.on('hourlyPlans.findOrCreate', findOrCreate.bind(null, socket));
    socket.on('hourlyPlans.updateCount', updateCount.bind(null, socket));
    socket.on('hourlyPlans.updatePlan', updatePlan.bind(null, socket));
  });

  function findOrCreate(socket, data, reply)
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

    var shiftMoment = moment(data.date);

    if (!shiftMoment.isValid()
      || !lodash.isString(data.division)
      || !divisions.modelsById[data.division]
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
      division: data.division,
      date: shiftMoment.toDate(),
      shift: data.shift
    };

    HourlyPlan.findOne(condition, function(err, hourlyPlan)
    {
      if (err)
      {
        return reply(err);
      }

      if (hourlyPlan)
      {
        return reply(
          canManage(user, hourlyPlan) ? null : new Error('AUTH'), hourlyPlan._id.toString()
        );
      }

      var creator = userInfo.createObject(user, socket);

      HourlyPlan.createForShift(condition, creator, function(err, hourlyPlan)
      {
        if (hourlyPlan)
        {
          app.broker.publish('hourlyPlans.created', {
            user: user,
            model: {
              _id: hourlyPlan._id,
              division: condition.division,
              date: condition.date,
              shift: condition.shift
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
      return reply(new Error('INPUT'));
    }

    var user = socket.handshake.user;

    HourlyPlan.findById(data._id, {createdAt: 1}).exec(function(err, hourlyPlan)
    {
      if (err)
      {
        return reply(err);
      }

      if (hourlyPlan === null)
      {
        return reply(new Error('UNKNOWN'));
      }

      if (!canManage(user, hourlyPlan))
      {
        return reply(new Error('AUTH'));
      }

      var update = {$set: {
        updatedAt: new Date(),
        updater: userInfo.createObject(user, socket)
      }};
      var field = 'flows.' + data.flowIndex;

      if (lodash.isNumber(data.hourIndex))
      {
        field += '.hours.' + data.hourIndex;
      }
      else
      {
        field += '.level';
      }

      update.$set[field] = data.newValue;

      HourlyPlan.update({_id: hourlyPlan._id}, update, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.broker.publish('hourlyPlans.updated.' + data._id, data);
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
      return reply(new Error('INPUT'));
    }

    var user = socket.handshake.user;

    if (!canManage(user))
    {
      return reply(new Error('AUTH'));
    }

    HourlyPlan.findById(data._id, {createdAt: 1}).exec(function(err, hourlyPlan)
    {
      if (err)
      {
        return reply(err);
      }

      if (hourlyPlan === null)
      {
        return reply(new Error('UNKNOWN'));
      }

      if (!canManage(user, hourlyPlan))
      {
        return reply(new Error('AUTH'));
      }

      var update = {$set: {
        updatedAt: new Date(),
        updater: userInfo.createObject(user, socket)
      }};

      update.$set['flows.' + data.flowIndex + '.noPlan'] = data.newValue;

      if (data.newValue)
      {
        update.$set['flows.' + data.flowIndex + '.level'] = 0;
        update.$set['flows.' + data.flowIndex + '.hours'] = [
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0
        ];
      }

      HourlyPlan.update({_id: hourlyPlan._id}, update, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.broker.publish('hourlyPlans.updated.' + data._id, data);
      });
    });
  }
};
