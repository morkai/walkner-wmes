// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var canManage = require('../canManage');
var findOrCreate = require('./findOrCreate');

module.exports = function setUpFteLeaderCommands(app, fteModule)
{
  var mongoose = app[fteModule.config.mongooseId];
  var userModule = app[fteModule.config.userId];
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

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

          var user = socket.handshake.user;

          if (!canManage(user, fteLeaderEntry, FteLeaderEntry.modelName))
          {
            return this.skip(new Error('AUTH'));
          }

          var task = fteLeaderEntry.tasks[data.taskIndex];

          if (!task || !task.functions[data.functionIndex])
          {
            return this.skip(new Error('INPUT'));
          }

          var companyIndex = typeof data.companyIndexServer === 'number'
            ? data.companyIndexServer
            : data.companyIndex;
          var taskCompany = task.functions[data.functionIndex].companies[companyIndex];

          if (!taskCompany)
          {
            return this.skip(new Error('INPUT'));
          }

          var taskCountProperty = 'tasks.' + data.taskIndex
            + '.functions.' + data.functionIndex
            + '.companies.' + companyIndex;

          if (typeof data.divisionIndex === 'number')
          {
            var taskDivision = taskCompany.count[data.divisionIndex];

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

          var totalsTemplate = {overall: 0};

          _.forEach(fteLeaderEntry.fteDiv, function(divisionId)
          {
            totalsTemplate[divisionId] = 0;
          });

          var rootTaskTotals = {
            oldTotals: task.totals,
            newTotals: _.clone(totalsTemplate)
          };

          task.totals = rootTaskTotals.newTotals;

          updateTaskTotals(task);

          var update = {
            $set: {
              updatedAt: fteLeaderEntry.updatedAt,
              updater: fteLeaderEntry.updater
            }
          };

          update.$set[taskCountProperty] = data.newCount;
          update.$set['tasks.' + data.taskIndex + '.totals'] = task.totals;

          if (task.parent)
          {
            var fteDivCount = Array.isArray(fteLeaderEntry.fteDiv) ? fteLeaderEntry.fteDiv.length : 0;
            var prodTaskMaps = fteModule.getCachedLeaderProdTaskMaps(data._id, fteLeaderEntry);

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

          var user = socket.handshake.user;

          if (!canManage(user, fteLeaderEntry, FteLeaderEntry.modelName))
          {
            return this.skip(new Error('AUTH'));
          }

          var task = fteLeaderEntry.tasks[data.taskIndex];

          if (!task)
          {
            return this.skip(new Error('INPUT'));
          }

          var update = {
            $set: {
              updatedAt: new Date(),
              updater: userModule.createUserInfo(user, socket)
            }
          };
          var taskCommentProperty = 'tasks.' + data.taskIndex + '.comment';
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

          var changes = this.changes;

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
    /*jshint -W073*/

    var parentTask = prodTaskMaps.idToTask[parentId];

    if (!parentTask)
    {
      return;
    }

    var oldTaskTotals = parentTask.totals;
    var newTaskTotals = _.clone(totalsTemplate);

    parentTask.totals = newTaskTotals;

    var childTasks = prodTaskMaps.idToChildren[parentId];
    var parentTaskIndex = prodTaskMaps.idToIndex[parentId];
    var parentTaskFunctions = parentTask.functions;
    var parentTotalsKeys = Object.keys(parentTask.totals);
    var functionCount = parentTaskFunctions.length;

    for (var taskIndex = 0; taskIndex < childTasks.length; ++taskIndex)
    {
      var childTask = childTasks[taskIndex];
      var firstTask = taskIndex === 0;

      for (var functionIndex = 0; functionIndex < functionCount; ++functionIndex)
      {
        var taskFunction = childTask.functions[functionIndex];

        for (var companyIndex = 0; companyIndex < taskFunction.companies.length; ++companyIndex)
        {
          var taskCompany = taskFunction.companies[companyIndex];
          var parentCompany = parentTaskFunctions[functionIndex].companies[companyIndex];
          var count = taskCompany.count;

          if (Array.isArray(count))
          {
            for (var divisionIndex = 0; divisionIndex < count.length; ++divisionIndex)
            {
              var divisionCount = count[divisionIndex];

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

            for (var keyI = 0; keyI < parentTotalsKeys.length; ++keyI)
            {
              parentTask.totals[parentTotalsKeys[keyI]] += count;
            }
          }
          else if (fteDivCount > 0)
          {
            count = Math.round(count / fteDivCount * 1000) / 1000;

            for (var i = 0; i < parentCompany.count.length; ++i)
            {
              var parentDivisionCount = parentCompany.count[i];

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
    var totalsKeys = Object.keys(task.totals);

    for (var functionI = 0; functionI < task.functions.length; ++functionI)
    {
      var taskFunction = task.functions[functionI];

      for (var companyI = 0; companyI < taskFunction.companies.length; ++companyI)
      {
        var taskCompany = taskFunction.companies[companyI];

        if (!Array.isArray(taskCompany.count))
        {
          for (var keyI = 0; keyI < totalsKeys.length; ++keyI)
          {
            task.totals[totalsKeys[keyI]] += taskCompany.count;
          }

          continue;
        }

        var taskDivisions = taskCompany.count;

        for (var divisionI = 0; divisionI < taskDivisions.length; ++divisionI)
        {
          var taskDivision = taskDivisions[divisionI];

          task.totals.overall += taskDivision.value;
          task.totals[taskDivision.division] += taskDivision.value;
        }
      }
    }
  }
};
