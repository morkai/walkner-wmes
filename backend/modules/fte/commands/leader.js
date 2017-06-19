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

  return {
    findOrCreate: findOrCreate.bind(null, app, fteModule, FteLeaderEntry),
    updateCount: function(socket, data, reply)
    {
      if (!_.isFunction(reply))
      {
        reply = function() {};
      }

      if (!_.isObject(data)
        || !_.isString(data._id)
        || !_.isNumber(data.taskIndex)
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
            return this.skip(new Error('UNKNOWN'));
          }

          const user = socket.handshake.user;

          if (!canManage(user, fteLeaderEntry, FteLeaderEntry.modelName))
          {
            return this.skip(new Error('AUTH'));
          }

          const task = fteLeaderEntry.tasks[data.taskIndex];

          if (!task || !task.functions[data.functionIndex])
          {
            return this.skip(new Error('INPUT'));
          }

          const companyIndex = typeof data.companyIndexServer === 'number'
            ? data.companyIndexServer
            : data.companyIndex;
          const taskCompany = task.functions[data.functionIndex].companies[companyIndex];

          if (!taskCompany)
          {
            return this.skip(new Error('INPUT'));
          }

          let taskCountProperty = 'tasks.' + data.taskIndex
            + '.functions.' + data.functionIndex
            + '.companies.' + companyIndex;

          if (typeof data.divisionIndex === 'number')
          {
            const taskDivision = taskCompany.count[data.divisionIndex];

            if (!taskDivision)
            {
              return this.skip(new Error('INPUT'));
            }

            taskCountProperty += '.count.' + data.divisionIndex + '.value';

            taskDivision.value = data.newCount;
          }
          else if (Array.isArray(taskCompany.count))
          {
            return this.skip(new Error('INPUT'));
          }
          else
          {
            taskCountProperty += '.count';

            taskCompany.count = data.newCount;
          }

          fteLeaderEntry.updatedAt = new Date();
          fteLeaderEntry.updater = userModule.createUserInfo(user, socket);

          const totalsTemplate = {overall: 0};

          _.forEach(fteLeaderEntry.fteDiv, function(divisionId)
          {
            totalsTemplate[divisionId] = 0;
          });

          let rootTaskTotals = {
            oldTotals: task.totals,
            newTotals: _.clone(totalsTemplate)
          };

          task.totals = rootTaskTotals.newTotals;

          updateTaskTotals(task);

          const update = {
            $set: {
              updatedAt: fteLeaderEntry.updatedAt,
              updater: fteLeaderEntry.updater
            }
          };

          update.$set[taskCountProperty] = data.newCount;
          update.$set['tasks.' + data.taskIndex + '.totals'] = task.totals;

          if (task.parent)
          {
            const fteDivCount = Array.isArray(fteLeaderEntry.fteDiv) ? fteLeaderEntry.fteDiv.length : 0;
            const prodTaskMaps = fteModule.getCachedLeaderProdTaskMaps(data._id, fteLeaderEntry);

            rootTaskTotals = updateParentCount(
              task.parent.toString(),
              totalsTemplate,
              fteDivCount,
              prodTaskMaps,
              update
            );
          }

          _.forEach(fteLeaderEntry.totals, function(oldValue, key)
          {
            fteLeaderEntry.totals[key] += rootTaskTotals.newTotals[key] - rootTaskTotals.oldTotals[key];
          });

          update.$set.totals = fteLeaderEntry.totals;

          FteLeaderEntry.collection.update({_id: fteLeaderEntry._id}, update, this.next());
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

            app.broker.publish('fte.leader.updated.' + data._id, data);
          }

          setImmediate(this.releaseLock);

          this.releaseLock = null;
          this.changes = null;
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
        return reply(new Error('INPUT'));
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
            return this.skip(new Error('UNKNOWN'));
          }

          const user = socket.handshake.user;

          if (!canManage(user, fteLeaderEntry, FteLeaderEntry.modelName))
          {
            return this.skip(new Error('AUTH'));
          }

          const task = fteLeaderEntry.tasks[data.taskIndex];

          if (!task)
          {
            return this.skip(new Error('INPUT'));
          }

          const update = {
            $set: {
              updatedAt: new Date(),
              updater: userModule.createUserInfo(user, socket)
            }
          };
          const taskCommentProperty = 'tasks.' + data.taskIndex + '.comment';
          update.$set[taskCommentProperty] = data.comment.trim();

          FteLeaderEntry.collection.update({_id: fteLeaderEntry._id}, update, this.next());

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

            app.broker.publish('fte.leader.updated.' + data._id, data);
          }

          setImmediate(this.releaseLock);

          this.releaseLock = null;
          this.changes = null;
        }
      );
    }
  };

  function updateParentCount(parentId, totalsTemplate, fteDivCount, prodTaskMaps, update)
  {
    /* jshint -W073*/

    const parentTask = prodTaskMaps.idToTask[parentId];

    if (!parentTask)
    {
      return;
    }

    const oldTaskTotals = parentTask.totals;
    const newTaskTotals = _.clone(totalsTemplate);

    parentTask.totals = newTaskTotals;

    const childTasks = prodTaskMaps.idToChildren[parentId];
    const parentTaskIndex = prodTaskMaps.idToIndex[parentId];
    const parentTaskFunctions = parentTask.functions;
    const parentTotalsKeys = Object.keys(parentTask.totals);
    const functionCount = parentTaskFunctions.length;

    for (let taskIndex = 0; taskIndex < childTasks.length; ++taskIndex)
    {
      const childTask = childTasks[taskIndex];
      const firstTask = taskIndex === 0;

      for (let functionIndex = 0; functionIndex < functionCount; ++functionIndex)
      {
        const taskFunction = childTask.functions[functionIndex];

        for (let companyIndex = 0; companyIndex < taskFunction.companies.length; ++companyIndex)
        {
          const taskCompany = taskFunction.companies[companyIndex];
          const parentCompany = parentTaskFunctions[functionIndex].companies[companyIndex];
          let count = taskCompany.count;

          if (Array.isArray(count))
          {
            for (let divisionIndex = 0; divisionIndex < count.length; ++divisionIndex)
            {
              const divisionCount = count[divisionIndex];

              if (firstTask)
              {
                parentCompany.count[divisionIndex].value = divisionCount.value;
              }
              else
              {
                parentCompany.count[divisionIndex].value += divisionCount.value;
              }

              parentTask.totals.overall += divisionCount.value;
              parentTask.totals[divisionCount.division] += divisionCount.value;
            }
          }
          else if (typeof parentCompany.count === 'number')
          {
            if (firstTask)
            {
              parentCompany.count = count;
            }
            else
            {
              parentCompany.count += count;
            }

            for (let keyI = 0; keyI < parentTotalsKeys.length; ++keyI)
            {
              parentTask.totals[parentTotalsKeys[keyI]] += count;
            }
          }
          else if (fteDivCount > 0)
          {
            count = Math.round(count / fteDivCount * 1000) / 1000;

            for (let i = 0; i < parentCompany.count.length; ++i)
            {
              const parentDivisionCount = parentCompany.count[i];

              if (firstTask)
              {
                parentDivisionCount.value = count;
              }
              else
              {
                parentDivisionCount.value += count;
              }

              parentTask.totals.overall += count;
              parentTask.totals[parentDivisionCount.division] += count;
            }
          }
        }
      }
    }

    update.$set['tasks.' + parentTaskIndex + '.totals'] = parentTask.totals;
    update.$set['tasks.' + parentTaskIndex + '.functions'] = parentTask.functions;

    if (parentTask.parent)
    {
      return updateParentCount(parentTask.parent.toString(), totalsTemplate, fteDivCount, prodTaskMaps, update);
    }

    return {
      oldTotals: oldTaskTotals,
      newTotals: newTaskTotals
    };
  }

  function updateTaskTotals(task)
  {
    const totalsKeys = Object.keys(task.totals);

    for (let functionI = 0; functionI < task.functions.length; ++functionI)
    {
      const taskFunction = task.functions[functionI];

      for (let companyI = 0; companyI < taskFunction.companies.length; ++companyI)
      {
        const taskCompany = taskFunction.companies[companyI];

        if (!Array.isArray(taskCompany.count))
        {
          for (let keyI = 0; keyI < totalsKeys.length; ++keyI)
          {
            task.totals[totalsKeys[keyI]] += taskCompany.count;
          }

          continue;
        }

        const taskDivisions = taskCompany.count;

        for (let divisionI = 0; divisionI < taskDivisions.length; ++divisionI)
        {
          const taskDivision = taskDivisions[divisionI];

          task.totals.overall += taskDivision.value;
          task.totals[taskDivision.division] += taskDivision.value;
        }
      }
    }
  }
};
