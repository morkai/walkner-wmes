'use strict';

var lodash = require('lodash');

module.exports = function setUpFteMasterCommands(app, fteModule)
{
  var mongoose = app[fteModule.config.mongooseId];
  var subdivisions = app[fteModule.config.subdivisionsId];
  var FteMasterEntry = mongoose.model('FteMasterEntry');

  function canManageMasterEntry(user)
  {
    return user.super
      || (Array.isArray(user.privileges)
        && user.privileges.indexOf('FTE:MASTER:MANAGE') !== -1);
  }

  return {
    getCurrentEntryId: function(socket, subdivisionId, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      var user = socket.handshake.user;

      if (!canManageMasterEntry(user))
      {
        return reply(new Error('AUTH'));
      }

      var validDivision = subdivisions.models.some(function(subdivision)
      {
        return subdivision.get('_id').toString() === subdivisionId;
      });

      if (!validDivision)
      {
        return reply(new Error('INPUT'));
      }

      var currentShift = fteModule.getCurrentShift();
      var condition = {
        subdivision: subdivisionId,
        date: currentShift.date,
        shift: currentShift.no
      };
      var fields = {_id: 1, locked: 1};

      FteMasterEntry.findOne(condition, fields).lean().exec(function(err, fteMasterEntry)
      {
        if (err)
        {
          return reply(err);
        }

        if (fteMasterEntry !== null)
        {
          return reply(
            fteMasterEntry.locked ? new Error('LOCKED') : null,
            fteMasterEntry._id.toString()
          );
        }

        currentShift.subdivision = subdivisionId;

        FteMasterEntry.createForShift(currentShift, user, function(err, fteMasterEntry)
        {
          if (fteMasterEntry)
          {
            app.broker.publish('fte.master.created', {
              user: user,
              model: {
                _id: fteMasterEntry.get('_id'),
                subdivision: currentShift.subdivision,
                date: currentShift.date,
                shift: currentShift.no
              }
            });
          }

          return reply(err, fteMasterEntry ? fteMasterEntry._id.toString() : null);
        });
      });
    },
    updateCount: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isString(data._id)
        || !lodash.isNumber(data.taskIndex)
        || !lodash.isNumber(data.functionIndex)
        || !lodash.isNumber(data.companyIndex)
        || !lodash.isNumber(data.newCount))
      {
        return reply(new Error('INVALID_INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManageMasterEntry(user))
      {
        return reply(new Error('AUTH'));
      }

      var condition = {_id: data._id};
      var fields = {locked: 1};

      FteMasterEntry.findOne(condition, fields).exec(function(err, fteMasterEntry)
      {
        if (err)
        {
          return reply(err);
        }

        if (fteMasterEntry === null)
        {
          return reply(new Error('UNKNOWN_ENTRY'));
        }

        if (fteMasterEntry.get('locked'))
        {
          return reply(new Error('ENTRY_LOCKED'));
        }

        var update = {$set: {
          updatedAt: new Date(),
          updater: user._id,
          updaterLabel: user.login
        }};
        var field = 'tasks.' + data.taskIndex
          + '.functions.' + data.functionIndex
          + '.companies.' + data.companyIndex
          + '.count';

        update.$set[field] = data.newCount;

        FteMasterEntry.update(condition, update, function(err, updatedCount)
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

          app.pubsub.publish('fte.master.updated.' + data._id, data);
        });
      });
    },
    updatePlan: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isString(data._id)
        || !lodash.isString(data.taskId)
        || !lodash.isBoolean(data.newValue)
        || !lodash.isNumber(data.taskIndex))
      {
        return reply(new Error('INVALID_INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManageMasterEntry(user))
      {
        return reply(new Error('AUTH'));
      }

      var condition = {_id: data._id, 'tasks.id': data.taskId};
      var fields = {locked: 1, 'tasks.$': 1};

      FteMasterEntry.findOne(condition, fields).exec(function(err, fteMasterEntry)
      {
        if (err)
        {
          return reply(err);
        }

        if (fteMasterEntry === null)
        {
          return reply(new Error('UNKNOWN_ENTRY'));
        }

        var tasks = fteMasterEntry.get('tasks');

        if (tasks.length !== 1)
        {
          return reply(new Error('UNKNOWN_TASK'));
        }

        if (fteMasterEntry.get('locked'))
        {
          return reply(new Error('ENTRY_LOCKED'));
        }

        var update = {$set: {
          updatedAt: new Date(),
          updater: user._id,
          updaterLabel: user.login
        }};

        if (data.newValue)
        {
          var task = tasks[0];
          task.noPlan = true;

          task.functions.forEach(function(functionEntry)
          {
            functionEntry.companies.forEach(function(companyEntry)
            {
              companyEntry.count = 0;
            });
          });

          update.$set['tasks.' + data.taskIndex] = task;
        }
        else
        {
          update.$set['tasks.' + data.taskIndex + '.noPlan'] = data.newValue;
        }

        FteMasterEntry.update(condition, update, function(err, updatedCount)
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

          app.pubsub.publish('fte.master.updated.' + data._id, data);
        });
      });
    },
    lockEntry: function(socket, fteMasterEntryId, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      var user = socket.handshake.user;

      if (!canManageMasterEntry(user))
      {
        return reply(new Error('AUTH'));
      }

      FteMasterEntry.lock(fteMasterEntryId, user, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.pubsub.publish('fte.master.locked.' + fteMasterEntryId);
      });
    },
    addAbsentUser: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isString(data._id)
        || !lodash.isObject(data.user)
        || !lodash.isString(data.user.id)
        || !lodash.isString(data.user.name)
        || !lodash.isString(data.user.personellId))
      {
        return reply(new Error('INVALID_INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManageMasterEntry(user))
      {
        return reply(new Error('AUTH'));
      }

      FteMasterEntry.addAbsentUser(data._id, data.user, user, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.pubsub.publish('fte.master.updated.' + data._id, data);
      });
    },
    removeAbsentUser: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isString(data._id)
        || !lodash.isString(data.userId))
      {
        return reply(new Error('INVALID_INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManageMasterEntry(user))
      {
        return reply(new Error('AUTH'));
      }

      FteMasterEntry.removeAbsentUser(data._id, data.userId, user, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.pubsub.publish('fte.master.updated.' + data._id, data);
      });
    }
  };
};
