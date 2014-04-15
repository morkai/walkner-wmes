// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var userInfo = require('../../../models/userInfo');
var canManage = require('../canManage');
var findOrCreate = require('./findOrCreate');

module.exports = function setUpFteMasterCommands(app, fteModule)
{
  var mongoose = app[fteModule.config.mongooseId];
  var subdivisionsModule = app[fteModule.config.subdivisionsId];
  var FteMasterEntry = mongoose.model('FteMasterEntry');

  return {
    findOrCreate: findOrCreate.bind(null, app, subdivisionsModule, FteMasterEntry),
    updateCount: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isObject(data)
        || !lodash.isString(data._id)
        || !lodash.isNumber(data.taskIndex)
        || !lodash.isNumber(data.functionIndex)
        || !lodash.isNumber(data.companyIndex)
        || !lodash.isNumber(data.newCount))
      {
        return reply(new Error('INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManage(user, FteMasterEntry))
      {
        return reply(new Error('AUTH'));
      }

      FteMasterEntry.findById(data._id).exec(function(err, fteMasterEntry)
      {
        if (err)
        {
          return reply(err);
        }

        if (fteMasterEntry === null)
        {
          return reply(new Error('UNKNOWN'));
        }

        if (!canManage(user, fteMasterEntry))
        {
          return reply(new Error('AUTH'));
        }

        fteMasterEntry.updateCount(data, userInfo.createObject(user, socket), function(err)
        {
          if (err)
          {
            return reply(err);
          }

          reply();

          app.broker.publish('fte.master.updated.' + data._id, data);
        });
      });
    },
    updatePlan: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isObject(data)
        || !lodash.isString(data._id)
        || !lodash.isString(data.taskId)
        || !lodash.isBoolean(data.newValue)
        || !lodash.isNumber(data.taskIndex))
      {
        return reply(new Error('INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManage(user, FteMasterEntry))
      {
        return reply(new Error('AUTH'));
      }

      FteMasterEntry.findById(data._id).exec(function(err, fteMasterEntry)
      {
        if (err)
        {
          return reply(err);
        }

        if (fteMasterEntry === null)
        {
          return reply(new Error('UNKNOWN'));
        }

        if (!canManage(user, fteMasterEntry))
        {
          return reply(new Error('AUTH'));
        }

        fteMasterEntry.updatePlan(data, userInfo.createObject(user, socket), function(err)
        {
          if (err)
          {
            return reply(err);
          }

          reply();

          app.broker.publish('fte.master.updated.' + data._id, data);
        });
      });
    },
    addAbsentUser: function(socket, data, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isObject(data)
        || !lodash.isString(data._id)
        || !lodash.isObject(data.user)
        || !lodash.isString(data.user.id)
        || !lodash.isString(data.user.name)
        || !lodash.isString(data.user.personellId))
      {
        return reply(new Error('INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManage(user, FteMasterEntry))
      {
        return reply(new Error('AUTH'));
      }

      var updater = userInfo.createObject(user, socket);

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
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isObject(data)
        || !lodash.isString(data._id)
        || !lodash.isString(data.userId))
      {
        return reply(new Error('INPUT'));
      }

      var user = socket.handshake.user;

      if (!canManage(user, FteMasterEntry))
      {
        return reply(new Error('AUTH'));
      }

      var updater = userInfo.createObject(user, socket);

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
