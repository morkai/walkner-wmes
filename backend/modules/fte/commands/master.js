// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var canManage = require('../canManage');
var findOrCreate = require('./findOrCreate');

module.exports = function setUpFteMasterCommands(app, fteModule)
{
  var mongoose = app[fteModule.config.mongooseId];
  var userModule = app[fteModule.config.userId];
  var FteMasterEntry = mongoose.model('FteMasterEntry');

  return {
    findOrCreate: findOrCreate.bind(null, app, fteModule, FteMasterEntry),
    updateCount: function(socket, data, reply)
    {
      if (!_.isFunction(reply))
      {
        reply = function() {};
      }

      if (!_.isObject(data)
        || !_.isString(data._id)
        || !_.isNumber(data.taskIndex)
        || !_.isNumber(data.functionIndex)
        || !_.isNumber(data.companyIndex)
        || !_.isNumber(data.newCount))
      {
        return reply(new Error('INPUT'));
      }

      data.newCount = Math.max(0, data.newCount);

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
            return this.skip(new Error('UNKNOWN'));
          }

          var user = socket.handshake.user;

          if (!canManage(user, fteMasterEntry, FteMasterEntry.modelName))
          {
            return this.skip(new Error('AUTH'));
          }

          var task = fteMasterEntry.tasks[data.taskIndex];

          if (!task || !task.functions[data.functionIndex])
          {
            return this.skip(new Error('INPUT'));
          }

          var taskCompany = task.functions[data.functionIndex].companies[data.companyIndex];

          if (!taskCompany)
          {
            return this.skip(new Error('INPUT'));
          }

          var newTaskTotal = 0;

          for (var functionI = 0; functionI < task.functions.length; ++functionI)
          {
            var taskFunctionCompanies = task.functions[functionI].companies;

            for (var companyI = 0; companyI < taskFunctionCompanies.length; ++companyI)
            {
              if (functionI === data.functionIndex && companyI === data.companyIndex)
              {
                newTaskTotal += data.newCount;
              }
              else
              {
                newTaskTotal += taskFunctionCompanies[companyI].count;
              }
            }
          }

          var newOverallTotal = fteMasterEntry.total - task.total + newTaskTotal;
          var update = {
            $set: {
              updatedAt: new Date(),
              updater: userModule.createUserInfo(user, socket),
              total: newOverallTotal
            }
          };
          var taskTotalProperty = 'tasks.' + data.taskIndex + '.total';
          var taskCountProperty = 'tasks.' + data.taskIndex
            + '.functions.' + data.functionIndex
            + '.companies.' + data.companyIndex
            + '.count';

          update.$set[taskTotalProperty] = newTaskTotal;
          update.$set[taskCountProperty] = data.newCount;

          FteMasterEntry.collection.update({_id: fteMasterEntry._id}, update, this.next());

          this.changes = {
            entry: fteMasterEntry,
            updatedAt: update.$set.updatedAt,
            updater: update.$set.updater,
            total: newOverallTotal,
            task: task,
            taskTotal: newTaskTotal,
            taskCompany: taskCompany,
            taskCompanyCount: data.newCount
          };
        },
        function applyChangesStep(err)
        {
          if (err)
          {
            return this.skip(err);
          }

          var changes = this.changes;

          changes.entry.updatedAt = changes.updatedAt;
          changes.entry.updater = changes.updater;
          changes.entry.total = changes.total;
          changes.task.total = changes.taskTotal;
          changes.taskCompany.count = changes.taskCompanyCount;
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

            app.broker.publish('fte.master.updated.' + data._id, data);
          }

          setImmediate(this.releaseLock);

          this.releaseLock = null;
          this.changes = null;
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
        return reply(new Error('INPUT'));
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
        function updateCountStep(err, fteMasterEntry)
        {
          if (err)
          {
            return this.skip(err);
          }

          if (!fteMasterEntry)
          {
            return this.skip(new Error('UNKNOWN'));
          }

          var user = socket.handshake.user;

          if (!canManage(user, fteMasterEntry, FteMasterEntry.modelName))
          {
            return this.skip(new Error('AUTH'));
          }

          var oldTask = fteMasterEntry.tasks[data.taskIndex];

          if (!oldTask)
          {
            return this.skip(new Error('INPUT'));
          }

          var newTask = {
            type: oldTask.type,
            id: oldTask.id,
            name: oldTask.name,
            noPlan: data.newValue,
            functions: [],
            total: 0
          };

          for (var functionI = 0; functionI < oldTask.functions.length; ++functionI)
          {
            var oldTaskFunction = oldTask.functions[functionI];
            var newTaskFunction = {
              id: oldTaskFunction.id,
              companies: []
            };
            var oldTaskFunctionCompanies = oldTaskFunction.companies;

            newTask.functions.push(newTaskFunction);

            for (var companyI = 0; companyI < oldTaskFunctionCompanies.length; ++companyI)
            {
              var oldTaskFunctionCompany = oldTaskFunctionCompanies[companyI];

              newTaskFunction.companies.push({
                id: oldTaskFunctionCompany.id,
                name: oldTaskFunctionCompany.name,
                count: 0
              });
            }
          }

          var newOverallTotal = fteMasterEntry.total - oldTask.total;
          var update = {
            $set: {
              updatedAt: new Date(),
              updater: userModule.createUserInfo(user, socket),
              total: newOverallTotal
            }
          };
          update.$set['tasks.' + data.taskIndex] = newTask;

          FteMasterEntry.collection.update({_id: fteMasterEntry._id}, update, this.next());

          this.changes = {
            entry: fteMasterEntry,
            updatedAt: update.$set.updatedAt,
            updater: update.$set.updater,
            total: newOverallTotal,
            task: newTask
          };
        },
        function applyChangesStep(err)
        {
          if (err)
          {
            return this.skip(err);
          }

          var changes = this.changes;

          changes.entry.updatedAt = changes.updatedAt;
          changes.entry.updater = changes.updater;
          changes.entry.total = changes.total;
          changes.entry.tasks[data.taskIndex] = changes.task;
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

            app.broker.publish('fte.master.updated.' + data._id, data);
          }

          setImmediate(this.releaseLock);

          this.releaseLock = null;
          this.changes = null;
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
        return reply(new Error('INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManage(user, FteMasterEntry))
      {
        return reply(new Error('AUTH'));
      }

      var updater = userModule.createUserInfo(user, socket);

      FteMasterEntry.addAbsentUser(data._id, data.user, updater, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.broker.publish('fte.master.updated.' + data._id, data);
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
        return reply(new Error('INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManage(user, FteMasterEntry))
      {
        return reply(new Error('AUTH'));
      }

      var updater = userModule.createUserInfo(user, socket);

      FteMasterEntry.removeAbsentUser(data._id, data.userId, updater, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.broker.publish('fte.master.updated.' + data._id, data);
      });
    }
  };
};
