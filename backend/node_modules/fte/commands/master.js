// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const canManage = require('../canManage');
const findOrCreate = require('./findOrCreate');

module.exports = function setUpFteMasterCommands(app, fteModule)
{
  const mongoose = app[fteModule.config.mongooseId];
  const userModule = app[fteModule.config.userId];
  const FteMasterEntry = mongoose.model('FteMasterEntry');

  function updateDemandCount(updater, entry, data, done)
  {
    const {companyId, newCount} = data;

    if (!_.isNumber(entry.totals.demand[companyId]))
    {
      return done(app.createError('INPUT', 400));
    }

    entry.totals.demand[companyId] = newCount;

    FteMasterEntry.calcTotals(entry, true);

    entry.updatedAt = new Date();
    entry.updater = updater;

    const update = {
      $set: {
        updatedAt: entry.updatedAt,
        updater: entry.updater,
        totals: entry.totals
      }
    };

    FteMasterEntry.collection.updateOne({_id: entry._id}, update, done);
  }

  function updateSupplyCount(updater, entry, data, done)
  {
    const {taskIndex, functionIndex, companyIndex, newCount} = data;
    const task = entry.tasks[taskIndex];

    if (!task || !task.functions[functionIndex])
    {
      return done(app.createError('INPUT', 400));
    }

    const taskCompany = task.functions[functionIndex].companies[companyIndex];

    if (!taskCompany)
    {
      return done(app.createError('INPUT', 400));
    }

    taskCompany.count = newCount;

    FteMasterEntry.calcTotals(entry, true);

    entry.updatedAt = new Date();
    entry.updater = updater;

    const update = {
      $set: {
        updatedAt: entry.updatedAt,
        updater: entry.updater,
        total: entry.total,
        totals: entry.totals,
        [`tasks.${taskIndex}`]: entry.tasks[taskIndex]
      }
    };

    FteMasterEntry.collection.updateOne({_id: entry._id}, update, done);
  }

  return {
    findOrCreate: findOrCreate.bind(null, app, fteModule, FteMasterEntry, 'MASTER'),
    updateCount: function(socket, data, reply)
    {
      if (!_.isFunction(reply))
      {
        reply = function() {};
      }

      if (!_.isPlainObject(data))
      {
        return reply(app.createError('INPUT', 400));
      }

      data.newCount = Math.max(0, data.newCount || 0);

      step(
        function acquireLockStep()
        {
          this.releaseLock = fteModule.acquireLock(data._id, this.next());
        },
        function getCachedEntryStep()
        {
          fteModule.getCachedEntry('master', data._id, this.next());
        },
        function updateCountStep(err, fteMasterEntry)
        {
          if (err)
          {
            return this.skip(err);
          }

          if (!fteMasterEntry)
          {
            return this.skip(app.createError('UNKNOWN', 404));
          }

          const user = socket.handshake.user;

          if (!canManage(user, fteMasterEntry, 'MASTER'))
          {
            return this.skip(app.createError('AUTH', 403));
          }

          this.entry = fteMasterEntry;

          const updater = userModule.createUserInfo(user, socket);

          if (data.kind === 'demand')
          {
            updateDemandCount(updater, this.entry, data, this.next());
          }
          else
          {
            updateSupplyCount(updater, this.entry, data, this.next());
          }
        },
        function sendResultStep(err)
        {
          if (err)
          {
            fteModule.cleanCachedEntry(data._id);
            reply(err);
          }
          else
          {
            reply();

            app.broker.publish(`fte.master.updated.${data._id}`, {
              type: 'count',
              socketId: data.socketId,
              task: this.entry.tasks[data.taskIndex],
              data: _.pick(this.entry, [
                'updatedAt',
                'updater',
                'totals',
                'total'
              ]),
              action: data
            });
          }

          setImmediate(this.releaseLock);
        }
      );
    },
    updatePlan: function(socket, data, reply)
    {
      if (!_.isFunction(reply))
      {
        reply = function() {};
      }

      if (!_.isObject(data)
        || !_.isString(data._id)
        || !_.isString(data.taskId)
        || !_.isBoolean(data.newValue)
        || !_.isNumber(data.taskIndex))
      {
        return reply(app.createError('INPUT', 400));
      }

      step(
        function acquireLockStep()
        {
          this.releaseLock = fteModule.acquireLock(data._id, this.next());
        },
        function getCachedEntryStep()
        {
          fteModule.getCachedEntry('master', data._id, this.next());
        },
        function updateCountStep(err, entry)
        {
          if (err)
          {
            return this.skip(err);
          }

          if (!entry)
          {
            return this.skip(app.createError('UNKNOWN', 404));
          }

          const user = socket.handshake.user;

          if (!canManage(user, entry, 'MASTER'))
          {
            return this.skip(app.createError('AUTH', 403));
          }

          const task = entry.tasks[data.taskIndex];

          if (!task)
          {
            return this.skip(app.createError('INPUT', 400));
          }

          task.noPlan = data.newValue;

          task.functions.forEach(f =>
          {
            f.companies.forEach(c =>
            {
              c.count = 0;
            });
          });

          FteMasterEntry.calcTotals(entry);

          entry.updatedAt = new Date();
          entry.updater = userModule.createUserInfo(user, socket);

          const update = {
            $set: {
              updatedAt: entry.updatedAt,
              updater: entry.updater,
              totals: entry.totals,
              total: entry.total,
              [`tasks.${data.taskIndex}`]: entry.tasks[data.taskIndex]
            }
          };

          FteMasterEntry.collection.updateOne({_id: entry._id}, update, this.next());

          this.entry = entry;
          this.task = task;
        },
        function sendResultStep(err)
        {
          if (err)
          {
            reply(err);
          }
          else
          {
            reply();

            app.broker.publish(`fte.master.updated.${data._id}`, {
              type: 'plan',
              socketId: data.socketId,
              task: this.entry.tasks[data.taskIndex],
              data: _.pick(this.entry, [
                'updatedAt',
                'updater',
                'totals',
                'total'
              ]),
              action: data
            });
          }

          setImmediate(this.releaseLock);
        }
      );
    },
    addAbsentUser: function(socket, data, reply)
    {
      if (!_.isFunction(reply))
      {
        reply = function() {};
      }

      if (!_.isObject(data)
        || !_.isString(data._id)
        || !_.isObject(data.user)
        || !_.isString(data.user.id)
        || !_.isString(data.user.name)
        || !_.isString(data.user.personellId))
      {
        return reply(app.createError('INPUT', 400));
      }

      const user = socket.handshake.user;

      if (!canManage(user, FteMasterEntry, 'MASTER'))
      {
        return reply(app.createError('AUTH', 403));
      }

      const updater = userModule.createUserInfo(user, socket);

      FteMasterEntry.addAbsentUser(data._id, data.user, updater, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.broker.publish(`fte.master.updated.${data._id}`, data);
      });
    },
    removeAbsentUser: function(socket, data, reply)
    {
      if (!_.isFunction(reply))
      {
        reply = function() {};
      }

      if (!_.isObject(data)
        || !_.isString(data._id)
        || !_.isString(data.userId))
      {
        return reply(app.createError('INPUT', 400));
      }

      const user = socket.handshake.user;

      if (!canManage(user, FteMasterEntry, 'MASTER'))
      {
        return reply(app.createError('AUTH', 403));
      }

      const updater = userModule.createUserInfo(user, socket);

      FteMasterEntry.removeAbsentUser(data._id, data.userId, updater, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.broker.publish(`fte.master.updated.${data._id}`, data);
      });
    }
  };
};
