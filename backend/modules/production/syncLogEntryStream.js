// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const logEntryHandlers = require('./logEntryHandlers');

const NEW_MRP = {
  'KE1': {
    subdivision: '529f269dcd8eea982400001d'
  },
  'KE2': {
    subdivision: '529f269dcd8eea982400001d'
  },
  'KE4': {
    subdivision: '529f269dcd8eea982400001d'
  },
  'KEA': {
    subdivision: '529f269dcd8eea982400001d',
    mrpControllers: ['KED']
  }
};

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

  const logEntryList = [];
  const savedAt = new Date();
  let lastLogEntryWithInvalidSecretKey = null;
  let lastLogEntryIndex = logEntryStream.length - 1;

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
        "Error while saving %d log entries: %s\n%s",
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
      throw new Error('TYPE');
    }

    if (!_.isFunction(logEntryHandlers[logEntry.type]))
    {
      throw new Error('UNKNOWN_HANDLER');
    }

    if (!_.isString(logEntry.secretKey)
      || logEntry.secretKey !== productionModule.secretKeys[logEntry.prodLine])
    {
      if (i === lastLogEntryIndex)
      {
        lastLogEntryWithInvalidSecretKey = logEntry;
      }

      throw new Error('SECRET_KEY');
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

    return new ProdLogEntry(fixOrgUnits(logEntry)).toObject();
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

  function fixOrgUnits(logEntry)
  {
    if (Array.isArray(logEntry.mrpControllers) && NEW_MRP[logEntry.mrpControllers[0]])
    {
      const newOrgUnits = NEW_MRP[logEntry.mrpControllers[0]];

      Object.assign(logEntry, newOrgUnits);

      if (logEntry.type === 'changeShift')
      {
        Object.assign(logEntry.data.startedProdShift, newOrgUnits);
      }
      else if (logEntry.data.prodLine)
      {
        Object.assign(logEntry.data, newOrgUnits);
      }
    }

    return logEntry;
  }
};
