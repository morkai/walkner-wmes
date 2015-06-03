// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var inspect = require('util').inspect;
var _ = require('lodash');
var logEntryHandlers = require('../logEntryHandlers');

module.exports = function syncCommand(app, productionModule, socket, logEntryStream, reply)
{
  if (!_.isFunction(reply))
  {
    reply = function() {};
  }

  if (!_.isString(logEntryStream) || _.isEmpty(logEntryStream))
  {
    return reply();
  }

  var userModule = app[productionModule.config.userId];
  var mongoose = app[productionModule.config.mongooseId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');

  logEntryStream = logEntryStream.split('\n');

  var lastLogEntryIndex = logEntryStream.length - 1;
  var logEntryList = [];
  var creator = userModule.createUserInfo(socket.handshake.user, socket);
  var lastLogEntryWithInvalidSecretKey = null;

  _.forEach(logEntryStream, function(logEntryJson, i)
  {
    try
    {
      var logEntry = JSON.parse(logEntryJson);

      if (!_.isObject(logEntry))
      {
        return logInvalidEntry(new Error('TYPE'), logEntryJson);
      }

      if (!_.isFunction(logEntryHandlers[logEntry.type]))
      {
        return logInvalidEntry(new Error('UNKNOWN_HANDLER'), logEntryJson);
      }

      if (!_.isString(logEntry.secretKey) || logEntry.secretKey !== productionModule.secretKeys[logEntry.prodLine])
      {
        if (i === lastLogEntryIndex)
        {
          lastLogEntryWithInvalidSecretKey = logEntry;
        }

        return logInvalidEntry(new Error('SECRET_KEY'), logEntryJson);
      }

      if (!logEntry.creator)
      {
        logEntry.creator = creator;
      }
      else
      {
        logEntry.creator.ip = creator.ip;
      }

      logEntry.savedAt = new Date();
      logEntry.todo = true;

      logEntryList.push(new ProdLogEntry(logEntry).toObject());
    }
    catch (err)
    {
      logInvalidEntry(err, logEntryJson);
    }
  });

  if (lastLogEntryWithInvalidSecretKey)
  {
    socket.emit('production.locked', {
      secretKey: lastLogEntryWithInvalidSecretKey.secretKey,
      prodLine: lastLogEntryWithInvalidSecretKey.prodLine
    });
  }

  if (logEntryList.length === 0)
  {
    return reply();
  }

  ProdLogEntry.collection.insert(logEntryList, {continueOnError: true}, function(err)
  {
    if (err)
    {
      if (err.code === 11000)
      {
        var dupEntryId = (err.message || err.errmsg || err.err).match(/"(.*?)"/)[1];
        var dupEntry = _.find(logEntryList, function(logEntry)
        {
          return logEntry._id === dupEntryId;
        });

        productionModule.warn("Duplicate log entry detected: %s", inspect(dupEntry, {colors: false, depth: 10}));
      }
      else
      {
        productionModule.error("Error while saving log entries: %s", (err.stack || err.errmsg || err.err));
      }
    }

    reply();

    if (!productionModule.recreating)
    {
      app.broker.publish('production.logEntries.saved');
    }
  });

  function logInvalidEntry(err, logEntryJson)
  {
    productionModule.debug("Invalid log entry: %s\n%s", err.message, logEntryJson);
  }
};
