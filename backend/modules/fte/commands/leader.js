// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var step = require('h5.step');
var canManage = require('../canManage');
var findOrCreate = require('./findOrCreate');

module.exports = function setUpFteLeaderCommands(app, fteModule)
{
  var mongoose = app[fteModule.config.mongooseId];
  var userModule = app[fteModule.config.userId];
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');
  var fteEntryToUpdateQueue = {};

  function updateNext(fteEntryId, fteEntry)
  {
    var updateQueue = fteEntryToUpdateQueue[fteEntryId];

    if (!updateQueue)
    {
      return;
    }

    if (!updateQueue.length)
    {
      delete fteEntryToUpdateQueue[fteEntryId];

      return;
    }

    var update = updateQueue.shift();
    var steps = [];

    if (!fteEntry)
    {
      steps.push(
        function findEntryStep()
        {
          FteLeaderEntry.findById(fteEntryId).exec(this.next());
        },
        function handleFindEntryStep(err, fteLeaderEntry)
        {
          if (err)
          {
            return this.skip(err);
          }

          fteEntry = fteLeaderEntry;
        }
      );
    }

    steps.push(
      function assertStep()
      {
        if (!fteEntry)
        {
          return this.skip(new Error('UNKNOWN'));
        }

        if (!canManage(update.user, fteEntry))
        {
          return this.skip(new Error('AUTH'));
        }
      },
      function updateStep()
      {
        if (update.type === 'comment')
        {
          fteEntry.updateComment(update.data, update.userInfo, this.next());
        }
        else
        {
          fteEntry.updateCount(update.data, update.userInfo, this.next());
        }
      },
      function sendResponseStep(err)
      {
        update.reply(err || null);

        if (!err)
        {
          app.broker.publish('fte.leader.updated.' + fteEntryId, update.data);
        }

        setImmediate(function() { updateNext(fteEntryId, fteEntry); });
      }
    );

    step(steps);
  }

  return {
    findOrCreate: findOrCreate.bind(null, app, fteModule, FteLeaderEntry),
    updateCount: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isObject(data)
        || !lodash.isString(data._id)
        || !lodash.isNumber(data.taskIndex)
        || !lodash.isNumber(data.companyIndex)
        || !lodash.isNumber(data.newCount)
        || data.newCount < 0)
      {
        return reply(new Error('INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManage(user, FteLeaderEntry))
      {
        return reply(new Error('AUTH'));
      }

      if (!fteEntryToUpdateQueue[data._id])
      {
        fteEntryToUpdateQueue[data._id] = [];
      }

      fteEntryToUpdateQueue[data._id].push({
        type: 'count',
        user: user,
        userInfo: userModule.createUserInfo(user, socket),
        data: data,
        reply: reply
      });

      updateNext(data._id, null);
    },
    updateComment: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function()
        {
        };
      }

      if (!lodash.isObject(data)
        || !lodash.isString(data._id)
        || !lodash.isNumber(data.taskIndex)
        || !lodash.isString(data.comment))
      {
        return reply(new Error('INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManage(user, FteLeaderEntry))
      {
        return reply(new Error('AUTH'));
      }

      if (!fteEntryToUpdateQueue[data._id])
      {
        fteEntryToUpdateQueue[data._id] = [];
      }

      fteEntryToUpdateQueue[data._id].push({
        type: 'comment',
        user: user,
        userInfo: userModule.createUserInfo(user, socket),
        data: data,
        reply: reply
      });

      updateNext(data._id, null);
    }
  };
};
