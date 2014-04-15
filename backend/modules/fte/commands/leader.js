// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var userInfo = require('../../../models/userInfo');
var canManage = require('../canManage');
var findOrCreate = require('./findOrCreate');

module.exports = function setUpFteLeaderCommands(app, fteModule)
{
  var mongoose = app[fteModule.config.mongooseId];
  var subdivisionsModule = app[fteModule.config.subdivisionsId];
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  return {
    findOrCreate: findOrCreate.bind(null, app, subdivisionsModule, FteLeaderEntry),
    updateCount: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isObject(data)
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

      FteLeaderEntry.findById(data._id).exec(function(err, fteLeaderEntry)
      {
        if (err)
        {
          return reply(err);
        }

        if (fteLeaderEntry === null)
        {
          return reply(new Error('UNKNOWN'));
        }

        if (!canManage(user, fteLeaderEntry))
        {
          return reply(new Error('AUTH'));
        }

        fteLeaderEntry.updateCount(data, userInfo.createObject(user, socket), function(err)
        {
          if (err)
          {
            return reply(err);
          }

          reply();

          app.broker.publish('fte.leader.updated.' + data._id, data);
        });
      });
    }
  };
};
