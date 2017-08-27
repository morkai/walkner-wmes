// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const logEntryHandlers = require('./logEntryHandlers');

const ORG_UNIT_FIXES = {
  'LL500T-1': {
    prodFlow: '5812e9e13d1eb2140c744b18',
    workCenter: 'LL500T-1'
  },
  'LL500T-2': {
    prodFlow: '5812e9e13d1eb2140c744b28',
    workCenter: 'LL500T-2'
  },
  'CO1': {
    prodFlow: '52a840d88f4c4f300100006d',
    workCenter: 'INLED1-1'
  },
  'CO2': {
    prodFlow: '52a840d88f4c4f300100007d',
    workCenter: 'INLED1-2'
  },
  'CO3': {
    prodFlow: '52a840d88f4c4f300100008d',
    workCenter: 'INLED1-3'
  },
  'CO4': {
    prodFlow: '52a840d88f4c4f300100009d',
    workCenter: 'INLED1-4'
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
  const logEntrySet = new Set();
  const savedAt = new Date();
  const lastLogEntryIndex = logEntryStream.length - 1;
  let lastLogEntryWithInvalidSecretKey = null;

  _.forEach(logEntryStream, function(logEntryJson, i)
  {
    try
    {
      const logEntry = prepareProdLogEntry(logEntryJson, i, savedAt);

      if (!logEntrySet.has(logEntry._id))
      {
        logEntryList.push(logEntry);
        logEntrySet.add(logEntry._id);
      }
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
        'Error while saving %d log entries: %s\n%s',
        logEntryList.length,
        err.stack || err.message,
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
    productionModule.debug('Invalid log entry: %s\n%s', err.message, logEntryJson);
  }

  function createInsertStep(i)
  {
    return function insertStep(err)
    {
      if (err && err.code !== 11000)
      {
        productionModule.error(
          'Error while saving %d log entries (step %d): %s\n%s',
          logEntryList.length,
          i,
          err.stack || err.message,
          JSON.stringify({
            first: logEntryList[0],
            last: logEntryList.length === 1 ? null : logEntryList[logEntryList.length - 1]
          }) + (Array.isArray(err.writeErrors) ? `\n${err.writeErrors.map(e => e.code).join(', ')}` : '')
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
    const fix = ORG_UNIT_FIXES[logEntry.prodLine];

    if (!fix)
    {
      return logEntry;
    }

    Object.assign(logEntry, fix);

    if (logEntry.data.startedProdShift)
    {
      Object.assign(logEntry.data.startedProdShift, fix);
    }
    else if (logEntry.data.prodLine)
    {
      Object.assign(logEntry.data, fix);
    }

    return logEntry;
  }
};
