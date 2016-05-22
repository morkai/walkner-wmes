// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const logEntryHandlers = require('./logEntryHandlers');

module.exports = function syncLogEntryStream(app, productionModule, creator, logEntryStream, done)
{
  const ProdLogEntry = app[productionModule.config.mongooseId].model('ProdLogEntry');

  if (_.isString(logEntryStream))
  {
    logEntryStream = logEntryStream.split('\n');
  }

  if (!_.isArray(logEntryStream) || !logEntryStream.length)
  {
    return done();
  }

  let lastLogEntryIndex = logEntryStream.length - 1;
  const logEntryList = [];
  let lastLogEntryWithInvalidSecretKey = null;
  const savedAt = new Date();

  _.forEach(logEntryStream, function(logEntryJson, i)
  {
    try
    {
      logEntryList.push(prepareProdLogEntry(logEntryJson, i, savedAt));
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

  const insertSteps = [];
  const batchSize = 50;

  for (let i = 0, l = Math.ceil(logEntryList.length / batchSize); i < l; ++i)
  {
    insertSteps.push(createInsertStep(i));
  }

  insertSteps.push(function finalizeStep(err)
  {
    if (err)
    {
      productionModule.error(
        "Error while saving log %d entries: %s\n%s",
        logEntryList.length,
        err.stack || err.errmsg || err.err || err.message,
        JSON.stringify({
          first: logEntryList[0],
          last: logEntryList.length === 1 ? null : logEntryList[logEntryList.length - 1]
        })
      );
    }

    done();

    if (!productionModule.recreating)
    {
      app.broker.publish('production.logEntries.saved');
    }
  });

  step(insertSteps);

  function prepareProdLogEntry(logEntryJson, i, savedAt)
  {
    const logEntry = JSON.parse(logEntryJson);

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

    return new ProdLogEntry(logEntry).toObject();
  }

  function logInvalidEntry(err, logEntryJson)
  {
    productionModule.debug("Invalid log entry: %s\n%s", err.message, logEntryJson);
  }

  function createInsertStep(i)
  {
    return function insertStep(err)
    {
      if (err)
      {
        productionModule.error(
          "Error while saving %d log entries (step %d): %s\n%s",
          logEntryList.length,
          i,
          err.stack || err.errmsg || err.err || err.message,
          JSON.stringify({
            first: logEntryList[0],
            last: logEntryList.length === 1 ? null : logEntryList[logEntryList.length - 1]
          })
        );
      }

      ProdLogEntry.collection.insertMany(
        logEntryList.slice(i * batchSize, i * batchSize + batchSize),
        {ordered: false},
        this.next()
      );
    };
  }
};
