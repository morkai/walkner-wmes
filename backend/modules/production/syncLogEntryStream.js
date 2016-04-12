// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var inspect = require('util').inspect;
var _ = require('lodash');
var logEntryHandlers = require('./logEntryHandlers');

module.exports = function syncLogEntryStream(app, productionModule, creator, logEntryStream, done)
{
  var ProdLogEntry = app[productionModule.config.mongooseId].model('ProdLogEntry');

  if (_.isString(logEntryStream))
  {
    logEntryStream = logEntryStream.split('\n');
  }

  if (!_.isArray(logEntryStream) || !logEntryStream.length)
  {
    return done();
  }

  var lastLogEntryIndex = logEntryStream.length - 1;
  var logEntryList = [];
  var lastLogEntryWithInvalidSecretKey = null;
  var savedAt = new Date();
  var W_LINE = {
    'W-1~c': true,
    'W-2~c': true,
    'W1_SM-12_1~c': true,
    'W1_SM-12_2~c': true,
    'W1_SM-13_1~c': true,
    'W1_SM-13_2~c': true
  };

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

      logEntry.savedAt = savedAt;
      logEntry.todo = true;

      if (W_LINE[logEntry.prodLine])
      {
        handleWLineEntry(logEntry);
      }

      logEntryList.push(new ProdLogEntry(logEntry).toObject());
    }
    catch (err)
    {
      logInvalidEntry(err, logEntryJson);
    }
  });

  if (logEntryList.length === 0)
  {
    return done(null, lastLogEntryWithInvalidSecretKey);
  }

  ProdLogEntry.collection.insert(logEntryList, {ordered: false}, function(err)
  {
    if (err)
    {
      if (err.code === 11000)
      {
        var dupEntryId = (err.message || err.errmsg || err.err).match(/"(.*?)"/)[1];
        var dupEntry = _.find(logEntryList, function(logEntry) { return logEntry._id === dupEntryId; });

        productionModule.warn("Duplicate log entry detected: %s", inspect(dupEntry, {colors: false, depth: 10}));
      }
      else
      {
        productionModule.error("Error while saving log entries: %s", (err.stack || err.errmsg || err.err));
      }
    }

    done();

    if (!productionModule.recreating)
    {
      app.broker.publish('production.logEntries.saved');
    }
  });

  function logInvalidEntry(err, logEntryJson)
  {
    productionModule.debug("Invalid log entry: %s\n%s", err.message, logEntryJson);
  }

  function handleWLineEntry(logEntry)
  {
    logEntry.prodLine = logEntry.prodLine.split('~')[0];
    logEntry.workCenter = logEntry.workCenter.split('~')[0];
    logEntry.mrpControllers = logEntry.mrpControllers.map(function(mrp) { return mrp.split('~')[0]; });

    if (logEntry.data.prodLine)
    {
      logEntry.data.prodLine = logEntry.prodLine;
      logEntry.data.workCenter = logEntry.workCenter;
      logEntry.data.mrpControllers = logEntry.mrpControllers;
    }

    if (logEntry.data.startedProdShift)
    {
      logEntry.data.startedProdShift.prodLine = logEntry.prodLine;
      logEntry.data.startedProdShift.workCenter = logEntry.workCenter;
      logEntry.data.startedProdShift.mrpControllers = logEntry.mrpControllers;
    }
  }
};
