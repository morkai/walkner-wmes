'use strict';

var lodash = require('lodash');

module.exports = function setUpFteLeaderCommands(app, fteModule)
{
  var mongoose = app[fteModule.config.mongooseId];
  var subdivisions = app[fteModule.config.subdivisionsId];
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  function canManageLeaderEntry(user)
  {
    return user.super
      || (Array.isArray(user.privileges)
        && user.privileges.indexOf('FTE:LEADER:MANAGE') !== -1);
  }

  return {
    getCurrentEntryId: function(socket, subdivisionId, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      var user = socket.handshake.user;

      if (!canManageLeaderEntry(user))
      {
        return reply(new Error('AUTH'));
      }

      var validSubdivision = subdivisions.models.some(function(subdivision)
      {
        return subdivision.get('_id').toString() === subdivisionId;
      });

      if (!validSubdivision)
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

      FteLeaderEntry.findOne(condition, fields).lean().exec(function(err, fteLeaderEntry)
      {
        if (err)
        {
          return reply(err);
        }

        if (fteLeaderEntry !== null)
        {
          return reply(
            fteLeaderEntry.locked ? new Error('LOCKED') : null,
            fteLeaderEntry._id.toString()
          );
        }

        currentShift.subdivision = subdivisionId;

        FteLeaderEntry.createForShift(currentShift, user, function(err, fteLeaderEntry)
        {
          if (fteLeaderEntry)
          {
            app.broker.publish('fte.leader.created', {
              user: user,
              model: {
                _id: fteLeaderEntry.get('_id'),
                subdivision: currentShift.subdivision,
                date: currentShift.date,
                shift: currentShift.no
              }
            });
          }

          return reply(err, fteLeaderEntry ? fteLeaderEntry._id.toString() : null);
        });
      });
    },
    updateCount: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isNumber(data.taskIndex)
        || !lodash.isNumber(data.companyIndex)
        || !lodash.isNumber(data.newCount))
      {
        return reply(new Error('INVALID_INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManageLeaderEntry(user))
      {
        return reply(new Error('AUTH'));
      }

      var condition = {_id: data._id};
      var fields = {date: 1, shift: 1, locked: 1};

      FteLeaderEntry.findOne(condition, fields).exec(function(err, fteLeaderEntry)
      {
        if (err)
        {
          return reply(err);
        }

        if (fteLeaderEntry === null)
        {
          return reply(new Error('UNKNOWN_ENTRY'));
        }

        if (fteLeaderEntry.get('locked'))
        {
          return reply(new Error('ENTRY_LOCKED'));
        }

        var update = {$set: {
          updatedAt: new Date(),
          updater: user._id,
          updaterLabel: user.login
        }};
        var field = 'tasks.' + data.taskIndex + '.companies.' + data.companyIndex + '.count';

        update.$set[field] = data.newCount;

        FteLeaderEntry.update(condition, update, function(err, updatedCount)
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

          app.pubsub.publish('fte.leader.updated.' + data._id, data);
        });
      });
    },
    lockEntry: function(socket, fteLeaderEntryId, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      var user = socket.handshake.user;

      if (!canManageLeaderEntry(user))
      {
        return reply(new Error('AUTH'));
      }

      FteLeaderEntry.lock(fteLeaderEntryId, user, function(err)
      {
        if (err)
        {
          return reply(err);
        }

        reply();

        app.pubsub.publish('fte.leader.locked.' + fteLeaderEntryId);
      });
    }
  };
};
