'use strict';

var lodash = require('lodash');

module.exports = function setUpFteMasterCommands(app, fteModule)
{
  var mongoose = app[fteModule.config.mongooseId];
  var divisions = app[fteModule.config.divisionsId];
  var FteMasterEntry = mongoose.model('FteMasterEntry');

  function canManageMasterEntry(user)
  {
    return user.super
      || (Array.isArray(user.privileges)
        && user.privileges.indexOf('FTE:MASTER:MANAGE') !== -1);
  }

  return {
    getCurrentEntryId: function(socket, divisionId, reply)
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

        currentShift.division = divisionId;

        FteMasterEntry.createForShift(currentShift, user, function(err, fteMasterEntry)
        {
          if (fteMasterEntry)
          {
            app.broker.publish('fte.master.created', {
              user: user,
              model: {
                _id: fteMasterEntry.get('_id'),
                division: currentShift.division,
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

        update.$set['tasks.' + data.taskIndex + '.noPlan'] = data.newValue;

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
    }
  };
};
