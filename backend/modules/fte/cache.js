// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setUpFteCache(app, fteModule)
{
  const mongoose = app[fteModule.config.mongooseId];
  const FteMasterEntry = mongoose.model('FteMasterEntry');
  const FteLeaderEntry = mongoose.model('FteLeaderEntry');

  const idToFteLeaderEntryMapsMap = {};
  const idToFteEntryMap = {};
  const idToQueueMap = {};

  app.broker.subscribe('fte.*.deleted', onFteEntryDeleted);
  app.broker.subscribe('shiftChanged', onShiftChanged);

  fteModule.getCachedEntry = function(type, _id, done)
  {
    const cachedFteEntry = idToFteEntryMap[_id];

    if (cachedFteEntry)
    {
      return done(null, cachedFteEntry);
    }

    const FteEntryModel = type === 'master' ? FteMasterEntry : FteLeaderEntry;

    FteEntryModel.findById(_id).lean().exec(function(err, fteEntry)
    {
      if (err)
      {
        return done(err);
      }

      if (!fteEntry)
      {
        return done(null, null);
      }

      idToFteEntryMap[_id] = fteEntry;

      return done(null, fteEntry);
    });
  };

  fteModule.cleanCachedEntry = cleanCachedEntry;

  fteModule.getCachedLeaderProdTaskMaps = function(_id, fteLeaderEntry)
  {
    const cachedProdTaskMaps = idToFteLeaderEntryMapsMap[_id];

    if (cachedProdTaskMaps)
    {
      return cachedProdTaskMaps;
    }

    if (!fteLeaderEntry)
    {
      fteLeaderEntry = idToFteEntryMap[_id];
    }

    if (!fteLeaderEntry)
    {
      return null;
    }

    idToFteLeaderEntryMapsMap[_id] = FteLeaderEntry.mapProdTasks(fteLeaderEntry.tasks);

    return idToFteLeaderEntryMapsMap[_id];
  };

  fteModule.acquireLock = function(_id, done)
  {
    let queue = idToQueueMap[_id];

    if (queue)
    {
      queue.push(done);
    }
    else
    {
      queue = idToQueueMap[_id] = [];

      setImmediate(done);
    }

    return function releaseLock()
    {
      if (queue.length)
      {
        setImmediate(queue.shift());
      }
      else
      {
        delete idToQueueMap[_id];
      }
    };
  };

  function onFteEntryDeleted(message)
  {
    cleanCachedEntry(message.model._id.toString());
  }

  function onShiftChanged()
  {
    const oneHourAgo = Date.now() - 3600000;

    _.forEach(idToFteEntryMap, function(fteEntry, _id)
    {
      const updatedAt = (fteEntry.updatedAt || fteEntry.createdAt).getTime();

      if (updatedAt < oneHourAgo)
      {
        cleanCachedEntry(_id);
      }
    });
  }

  function cleanCachedEntry(_id)
  {
    delete idToFteEntryMap[_id];
    delete idToFteLeaderEntryMapsMap[_id];
  }
};
