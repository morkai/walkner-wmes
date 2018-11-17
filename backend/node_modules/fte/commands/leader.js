// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const canManage = require('../canManage');
const findOrCreate = require('./findOrCreate');

module.exports = function setUpFteLeaderCommands(app, fteModule)
{
  const mongoose = app[fteModule.config.mongooseId];
  const userModule = app[fteModule.config.userId];
  const FteLeaderEntry = mongoose.model('FteLeaderEntry');

  function updateDemandCount(updater, entry, data, done)
  {
    const {companyId, newCount} = data;

    if (!_.isNumber(entry.totals.demand[companyId]))
    {
      return done(app.createError('INPUT', 400));
    }

    entry.totals.demand[companyId] = newCount;

    FteLeaderEntry.calcTotals(entry);

    entry.updatedAt = new Date();
    entry.updater = updater;

    const update = {
      $set: {
        updatedAt: entry.updatedAt,
        updater: entry.updater,
        totals: entry.totals
      }
    };

    FteLeaderEntry.collection.updateOne({_id: entry._id}, update, done);
  }

  function updateSupplyCount(updater, entry, data, done)
  {
    const {taskIndex, functionIndex, divisionIndex, newCount} = data;
    const task = entry.tasks[data.taskIndex];

    if (!task)
    {
      return done(app.createError('INPUT', 400));
    }

    const companyIndex = typeof data.companyIndexServer === 'number'
      ? data.companyIndexServer
      : data.companyIndex;
    let taskCompany = task.companies[companyIndex];

    if (!taskCompany)
    {
      const taskFunction = task.functions[functionIndex];

      if (!taskFunction)
      {
        return done(app.createError('INPUT', 400));
      }

      taskCompany = taskFunction.companies[companyIndex];

      if (!taskCompany)
      {
        return done(app.createError('INPUT', 400));
      }
    }

    if (typeof divisionIndex === 'number')
    {
      const taskDivision = taskCompany.count[divisionIndex];

      if (!taskDivision)
      {
        return this.skip(app.createError('INPUT', 400));
      }

      taskDivision.value = newCount;
    }
    else if (Array.isArray(taskCompany.count))
    {
      return done(app.createError('INPUT', 400));
    }
    else
    {
      taskCompany.count = newCount;
    }

    const parentTasks = [];

    if (task.parent)
    {
      const fteDivCount = Array.isArray(entry.fteDiv) ? entry.fteDiv.length : 0;
      const prodTaskMaps = fteModule.getCachedLeaderProdTaskMaps(data._id, entry);

      updateParentSupply(
        task.parent.toString(),
        fteDivCount,
        prodTaskMaps,
        entry.absenceTasks || {},
        parentTasks
      );
    }

    FteLeaderEntry.calcTotals(entry);

    entry.updatedAt = new Date();
    entry.updater = updater;

    const update = {
      $set: {
        updatedAt: entry.updatedAt,
        updater: entry.updater,
        totals: entry.totals,
        [`tasks.${taskIndex}`]: entry.tasks[taskIndex]
      }
    };

    const changedTasks = [{
      index: taskIndex,
      data: entry.tasks[taskIndex]
    }];

    parentTasks.forEach(taskIndex =>
    {
      update.$set[`tasks.${taskIndex}`] = entry.tasks[taskIndex];

      changedTasks.push({
        index: taskIndex,
        data: entry.tasks[taskIndex]
      });
    });

    FteLeaderEntry.collection.updateOne({_id: entry._id}, update, err =>
    {
      if (err)
      {
        return done(err);
      }

      done(null, changedTasks);
    });
  }

  function updateParentSupply(parentTaskId, fteDivCount, prodTaskMaps, absenceTasks, parentTasks)
  {
    const parentTaskIndex = prodTaskMaps.idToIndex[parentTaskId];
    const parentTask = prodTaskMaps.idToTask[parentTaskId];
    let divisionDivided = false;

    parentTask.functions.forEach(taskFunction => taskFunction.companies.forEach(taskCompany =>
    {
      divisionDivided = divisionDivided || Array.isArray(taskCompany.count);

      if (divisionDivided)
      {
        taskCompany.count.forEach(taskDivision => { taskDivision.value = 0; });
      }
      else
      {
        taskCompany.count = 0;
      }
    }));

    prodTaskMaps.idToChildren[parentTaskId].forEach(childTask =>
    {
      if (absenceTasks[childTask.id] >= 0)
      {
        return;
      }

      childTask.functions.forEach((taskFunction, fI) =>
      {
        const parentTaskFunction = parentTask.functions[fI];

        taskFunction.companies.forEach((taskCompany, cI) =>
        {
          const parentTaskCompany = parentTaskFunction.companies[cI];

          if (Array.isArray(taskCompany.count))
          {
            taskCompany.count.forEach((taskDivision, dI) =>
            {
              parentTaskCompany.count[dI].value += taskDivision.value;
            });
          }
          else if (divisionDivided)
          {
            parentTaskCompany.count.forEach(parentTaskDivision =>
            {
              parentTaskDivision.value += taskCompany.count / fteDivCount;
            });
          }
          else
          {
            parentTaskCompany.count += taskCompany.count;
          }
        });
      });
    });

    parentTasks.push(parentTaskIndex);

    if (parentTask.parent)
    {
      updateParentSupply(parentTask.parent.toString(), fteDivCount, prodTaskMaps, parentTasks);
    }
  }

  return {
    findOrCreate: findOrCreate.bind(null, app, fteModule, FteLeaderEntry, 'LEADER'),
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
          fteModule.getCachedEntry('leader', data._id, this.next());
        },
        function updateCountStep(err, fteLeaderEntry)
        {
          if (err)
          {
            return this.skip(err);
          }

          if (!fteLeaderEntry)
          {
            return this.skip(app.createError('UNKNOWN', 404));
          }

          const user = socket.handshake.user;

          if (!canManage(user, fteLeaderEntry, 'LEADER'))
          {
            return this.skip(app.createError('AUTH', 403));
          }

          this.entry = fteLeaderEntry;

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
        function sendResultStep(err, changedTasks)
        {
          if (err)
          {
            fteModule.cleanCachedEntry(data._id);
            reply(err);
          }
          else
          {
            reply();

            app.broker.publish(`fte.leader.updated.${data._id}`, {
              type: 'count',
              socketId: data.socketId,
              tasks: changedTasks || [],
              data: _.pick(this.entry, [
                'updatedAt',
                'updater',
                'totals'
              ]),
              action: data
            });
          }

          setImmediate(this.releaseLock);
        }
      );
    },
    updateComment: function(socket, data, reply)
    {
      if (!_.isFunction(reply))
      {
        reply = function() {};
      }

      if (!_.isObject(data)
        || !_.isString(data._id)
        || !_.isNumber(data.taskIndex)
        || !_.isString(data.comment))
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
          fteModule.getCachedEntry('leader', data._id, this.next());
        },
        function updateCountStep(err, fteLeaderEntry)
        {
          if (err)
          {
            return this.skip(err);
          }

          if (!fteLeaderEntry)
          {
            return this.skip(app.createError('UNKNOWN', 404));
          }

          const user = socket.handshake.user;

          if (!canManage(user, fteLeaderEntry, 'LEADER'))
          {
            return this.skip(app.createError('AUTH', 403));
          }

          const task = fteLeaderEntry.tasks[data.taskIndex];

          if (!task)
          {
            return this.skip(app.createError('INPUT', 400));
          }

          const update = {
            $set: {
              updatedAt: new Date(),
              updater: userModule.createUserInfo(user, socket)
            }
          };
          const taskCommentProperty = `tasks.${data.taskIndex}.comment`;
          update.$set[taskCommentProperty] = data.comment.trim();

          FteLeaderEntry.collection.updateOne({_id: fteLeaderEntry._id}, update, this.next());

          this.changes = {
            entry: fteLeaderEntry,
            updatedAt: update.$set.updatedAt,
            updater: update.$set.updater,
            task: task,
            taskComment: update.$set[taskCommentProperty]
          };
        },
        function applyChangesStep(err)
        {
          if (err)
          {
            return this.skip(err);
          }

          const changes = this.changes;

          changes.entry.updatedAt = changes.updatedAt;
          changes.entry.updater = changes.updater;
          changes.task.comment = changes.taskComment;
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

            app.broker.publish(`fte.leader.updated.${data._id}`, data);
          }

          setImmediate(this.releaseLock);
        }
      );
    }
  };
};
