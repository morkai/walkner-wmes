// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');

module.exports = function setUpQiCounter(app, qiModule)
{
  const mongoose = app[qiModule.config.mongooseId];
  const QiResult = mongoose.model('QiResult');

  let nextResetAt = moment().startOf('day').add(1, 'day').hours(6).valueOf();
  let resetTimer = null;

  app.broker.subscribe('app.started', scheduleReset).setLimit(1);
  app.broker.subscribe('qi.results.added', handleAddedResult);
  app.broker.subscribe('qi.results.edited', handleEditedResult);
  app.broker.subscribe('qi.results.deleted', handleDeletedResult);

  qiModule.getActualCountForUser = function(userId, done)
  {
    const pipeline = [
      {$match: {
        'inspector.id': userId,
        inspectedAt: getCurrentTimeBoundaries()
      }},
      {$group: {
        _id: null,
        count: {$sum: '$qtyInspected'}
      }}
    ];

    QiResult.aggregate(pipeline, function(err, results)
    {
      if (err)
      {
        return done(err);
      }

      if (!results.length)
      {
        return done(null, 0);
      }

      return done(null, results[0].count);
    });
  };

  qiModule.resetCounters = function(done)
  {
    const pipeline = [
      {$match: {
        inspectedAt: getCurrentTimeBoundaries()
      }},
      {$group: {
        _id: '$inspector.id',
        count: {$sum: '$qtyInspected'}
      }}
    ];

    QiResult.aggregate(pipeline, function(err, results)
    {
      if (err)
      {
        return done(err);
      }

      scheduleReset();

      return done(null, results.map(function(result)
      {
        result = {
          user: result._id,
          count: result.count
        };

        app.broker.publish('qi.counter.recounted', result);

        return result;
      }));
    });
  };

  function getCurrentTimeBoundaries()
  {
    const inspectedAt = moment();

    if (inspectedAt.hour() < 6)
    {
      inspectedAt.subtract(1, 'days');
    }

    inspectedAt.startOf('day');

    return {
      $gte: new Date(inspectedAt.valueOf()),
      $lt: inspectedAt.add(1, 'days').toDate()
    };
  }

  function scheduleReset()
  {
    if (resetTimer)
    {
      clearTimeout(resetTimer);
    }

    let delay = nextResetAt - Date.now();

    if (delay <= 0)
    {
      nextResetAt = moment().startOf('day').add(1, 'day').hours(6).valueOf();

      return resetAllCounters();
    }

    if (delay > 3600000)
    {
      delay = 3600000;
    }
    else if (delay > 1000)
    {
      delay /= 2;
    }

    resetTimer = setTimeout(scheduleReset, delay);
  }

  function resetAllCounters()
  {
    qiModule.resetCounters(function(err)
    {
      if (err)
      {
        qiModule.error('Failed to reset counters: %s', err.message);
      }
    });
  }

  function resetUsersCounter(userId)
  {
    qiModule.getActualCountForUser(userId, function(err, count)
    {
      if (err)
      {
        qiModule.error('Failed to reset counter for user [%s]: %s', userId, err.message);
      }
      else
      {
        app.broker.publish('qi.counter.recounted', {
          user: userId,
          count: count
        });
      }
    });
  }

  function handleAddedResult(message)
  {
    resetUsersCounter(message.model.inspector.id);
  }

  function handleDeletedResult(message)
  {
    resetUsersCounter(message.model.inspector.id);
  }

  function handleEditedResult(message)
  {
    const result = message.model;
    const change = result.changes[result.changes.length - 1].data.inspector;

    if (!change)
    {
      return;
    }

    if (change[0])
    {
      resetUsersCounter(change[0].id);
    }

    if (change[1])
    {
      resetUsersCounter(change[1].id);
    }
  }
};
