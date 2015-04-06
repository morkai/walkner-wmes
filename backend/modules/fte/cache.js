// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function setUpFteCache(app, fteModule)
{
  var mongoose = app[fteModule.config.mongooseId];
  var FteMasterEntry = mongoose.model('FteMasterEntry');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var idToFteLeaderEntryMapsMap = {};
  var idToFteEntryMap = {};
  var idToQueueMap = {};

  app.broker.subscribe('fte.*.deleted', onFteEntryDeleted);
  app.broker.subscribe('shiftChanged', onShiftChanged);

  fteModule.getCachedEntry = function(type, _id, done)
  {
    var cachedFteEntry = idToFteEntryMap[_id];

    if (cachedFteEntry)
    {
      return done(null, cachedFteEntry);
    }

    var FteEntryModel = type === 'master' ? FteMasterEntry : FteLeaderEntry;

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
    var cachedProdTaskMaps = idToFteLeaderEntryMapsMap[_id];

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
    var queue = idToQueueMap[_id];

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
    var oneHourAgo = Date.now() - 3600000;

    _.forEach(idToFteEntryMap, function(fteEntry, _id)
    {
      var updatedAt = (fteEntry.updatedAt || fteEntry.createdAt).getTime();

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
