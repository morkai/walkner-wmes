// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var step = require('h5.step');
var parseControlCycles = require('./parseControlCycles');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_LS41\.txt$/,
  parsedOutputDir: null
};

exports.start = function startControlCyclesImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var WhTransferOrder = mongoose.model('WhTransferOrder');
  var WhControlCycle = mongoose.model('WhControlCycle');
  var WhControlCycleArchive = mongoose.model('WhControlCycleArchive');

  var filePathCache = {};
  var importQueue = [];
  var importLock = false;
  var restarting = false;

  app.broker.subscribe('updater.restarting', function()
  {
    restarting = true;
  });

  app.broker.subscribe('directoryWatcher.changed', queueFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    if (filePathCache[fileInfo.filePath] || !module.config.filterRe.test(fileInfo.fileName))
    {
      return false;
    }

    fileInfo.timeKey = createTimeKey(fileInfo.timestamp);

    return true;
  }

  function createTimeKey(timestamp)
  {
    return moment(timestamp).subtract(1, 'days').format('YYYYMMDD');
  }

  function queueFile(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    importQueue.push(fileInfo);

    module.debug("Queued %s...", fileInfo.timeKey);

    importNext();
  }

  function importNext()
  {
    if (importLock || !importQueue.length || restarting)
    {
      return;
    }

    importQueue.sort(function(a, b)
    {
      return a.timestamp - b.timestamp;
    });

    var startTime = Date.now();
    var fileInfo = importQueue.shift();

    importLock = true;

    module.debug("Importing %s...", fileInfo.timeKey);

    importFile(fileInfo, function(err, controlCycles)
    {
      cleanUpFileInfoFile(fileInfo);

      if (err)
      {
        module.error("Failed to import %s: %s", fileInfo.timeKey, err.message);
      }
      else
      {
        module.debug("Imported %d of %s in %d ms!", controlCycles.length, fileInfo.timeKey, Date.now() - startTime);
      }

      importLock = false;

      setImmediate(importNext);
    });
  }

  function importFile(fileInfo, done)
  {
    step(
      function readFileStep()
      {
        fs.readFile(fileInfo.filePath, {encoding: 'utf8'}, this.next());
      },
      function parseFileStep(err, fileContents)
      {
        if (err)
        {
          return this.skip(err);
        }

        module.debug("Parsing ~%d bytes of %s...", fileContents.length, fileInfo.timeKey);

        var t = Date.now();

        this.controlCycles = parseControlCycles(fileContents, new Date(fileInfo.timestamp));

        module.debug("Parsed %s in %d ms!", fileInfo.timeKey, Date.now() - t);

        setImmediate(this.next());
      },
      function createBatchesStep()
      {
        var batchSize = 1000;
        var batchCount = Math.ceil(this.controlCycles.length / batchSize);

        this.batches = [];

        for (var i = 0; i < batchCount; ++i)
        {
          this.batches.push(this.controlCycles.slice(i * batchSize, i * batchSize + batchSize));
        }

        setImmediate(this.next());
      },
      function archiveControlCyclesStep()
      {
        for (var i = 0, l = this.batches.length; i < l; ++i)
        {
          WhControlCycleArchive.collection.insert(this.batches[i], {continueOnError: true}, this.parallel());
        }
      },
      function handleArchiveError(err)
      {
        if (!err || err.code === 11000)
        {
          return;
        }

        if (err.err && !err.message)
        {
          var code = err.code;

          err = new Error(err.err);
          err.name = 'MongoError';
          err.code = code;
        }

        return this.skip(err);
      },
      function updateCurrentControlCyclesStep()
      {
        var steps = [];

        for (var i = 0, l = this.batches.length; i < l; ++i)
        {
          steps.push(createUpdateCurrentControlCyclesBatchStep(this.batches[i]));
        }

        steps.push(this.next());

        step(steps);
      },
      function(err)
      {
        done(err, this.controlCycles);
      }
    );
  }

  function createUpdateCurrentControlCyclesBatchStep(controlCyclesArchive)
  {
    return function updateCurrentControlCyclesBatchStep()
    {
      var ccOptions = {upsert: true};
      var toOptions = {multi: true};

      for (var i = 0, l = controlCyclesArchive.length; i < l; ++i)
      {
        var controlCycle = controlCyclesArchive[i];

        controlCycle._id = controlCycle._id.nc12;

        WhControlCycle.collection.update(
          {_id: controlCycle._id}, controlCycle, ccOptions, this.parallel()
        );
        WhTransferOrder.collection.update(
          {nc12: controlCycle._id}, {$set: {s: controlCycle.s}}, toOptions, this.parallel()
        );
      }
    };
  }

  function cleanUpFileInfoFile(fileInfo)
  {
    setTimeout(removeFilePathFromCache, 15000, fileInfo.filePath);

    if (module.config.parsedOutputDir)
    {
      moveFileInfoFile(fileInfo.filePath);
    }
    else
    {
      deleteFileInfoFile(fileInfo.filePath);
    }
  }

  function moveFileInfoFile(oldFilePath)
  {
    var newFilePath = path.join(module.config.parsedOutputDir, path.basename(oldFilePath));

    fs.rename(oldFilePath, newFilePath, function(err)
    {
      if (err)
      {
        module.error(
          "Failed to rename file [%s] to [%s]: %s", oldFilePath, newFilePath, err.message
        );
      }
    });
  }

  function deleteFileInfoFile(filePath)
  {
    fs.unlink(filePath, function(err)
    {
      if (err)
      {
        module.error("Failed to delete file [%s]: %s", filePath, err.message);
      }
    });
  }

  function removeFilePathFromCache(filePath)
  {
    delete filePathCache[filePath];
  }
};
