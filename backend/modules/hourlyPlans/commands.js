// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const _ = require('lodash');
const canManage = require('./canManage');

module.exports = function setUpHourlyPlansCommands(app, hourlyPlansModule)
{
  const mongoose = app[hourlyPlansModule.config.mongooseId];
  const userModule = app[hourlyPlansModule.config.userId];
  const divisionsModule = app[hourlyPlansModule.config.divisionsId];
  const HourlyPlan = mongoose.model('HourlyPlan');

  app[hourlyPlansModule.config.sioId].sockets.on('connection', function(socket)
  {
    socket.on('hourlyPlans.findOrCreate', findOrCreate.bind(null, socket));
    socket.on('hourlyPlans.updateCount', updateCount.bind(null, socket));
    socket.on('hourlyPlans.updatePlan', updatePlan.bind(null, socket));
    socket.on('hourlyPlans.updateCounts', updateCounts.bind(null, socket));
  });

  function findOrCreate(socket, data, reply)
  {
    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    const user = socket.handshake.user;

    if (!canManage(user))
    {
      return reply(new Error('AUTH'));
    }

    if (!_.isObject(data))
    {
      return reply(new Error('INPUT'));
    }

    const shiftMoment = moment(data.date);

    if (!shiftMoment.isValid()
      || !_.isString(data.division)
      || !divisionsModule.modelsById[data.division]
      || !_.isNumber(data.shift))
    {
      return reply(new Error('INPUT'));
    }

    shiftMoment.hours(0).minutes(0).seconds(0).milliseconds(0);

    if (shiftMoment.valueOf() > moment().startOf('day').add(7, 'days').valueOf())
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
        return reply(canManage(user, hourlyPlan) ? null : new Error('AUTH'), hourlyPlan._id.toString());
      }

      const creator = userModule.createUserInfo(user, socket);

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
    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    if (!_.isObject(data)
      || !_.isString(data._id)
      || !_.isNumber(data.flowIndex)
      || !_.isNumber(data.newValue))
    {
      return reply(new Error('INPUT'));
    }

    const user = socket.handshake.user;

    HourlyPlan.findById(data._id, {createdAt: 1}).lean().exec(function(err, hourlyPlan)
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

      const update = {$set: {
        updatedAt: new Date(),
        updater: userModule.createUserInfo(user, socket)
      }};
      let field = 'flows.' + data.flowIndex;

      if (_.isNumber(data.hourIndex))
      {
        field += '.hours.' + data.hourIndex;
      }
      else
      {
        field += '.level';
      }

      update.$set[field] = data.newValue;

      HourlyPlan.collection.update({_id: hourlyPlan._id}, update, function(err)
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
    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    if (!_.isObject(data)
      || !_.isString(data._id)
      || !_.isBoolean(data.newValue)
      || !_.isNumber(data.flowIndex))
    {
      return reply(new Error('INPUT'));
    }

    const user = socket.handshake.user;

    if (!canManage(user))
    {
      return reply(new Error('AUTH'));
    }

    HourlyPlan.findById(data._id, {createdAt: 1}).lean().exec(function(err, hourlyPlan)
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

      const update = {$set: {
        updatedAt: new Date(),
        updater: userModule.createUserInfo(user, socket)
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

      HourlyPlan.collection.update({_id: hourlyPlan._id}, update, function(err)
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

  function updateCounts(socket, data, reply)
  {
    if (!_.isFunction(reply))
    {
      reply = function() {};
    }

    if (!_.isObject(data)
      || !_.isString(data._id)
      || !_.isArray(data.newValues)
      || !_.isNumber(data.flowIndex))
    {
      return reply(new Error('INPUT'));
    }

    const user = socket.handshake.user;

    if (!canManage(user))
    {
      return reply(new Error('AUTH'));
    }

    HourlyPlan.findById(data._id, {createdAt: 1}).lean().exec(function(err, hourlyPlan)
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

      const update = {$set: {
        updatedAt: new Date(),
        updater: userModule.createUserInfo(user, socket)
      }};

      const newValues = new Array(24);

      for (let i = 0; i < 24; ++i)
      {
        const newValue = data.newValues[i];

        newValues[i] = !_.isNumber(newValue) || newValue < 0 ? 0 : newValue;
      }

      data.newValues = newValues;

      update.$set['flows.' + data.flowIndex + '.hours'] = data.newValues;

      HourlyPlan.collection.update({_id: hourlyPlan._id}, update, function(err)
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
