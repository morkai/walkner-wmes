// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var step = require('h5.step');
var parseTransferOrders = require('./parseTransferOrders');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_LT23\.txt$/,
  parsedOutputDir: null
};

exports.start = function startTransferOrdersImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var WhTransferOrder = mongoose.model('WhTransferOrder');
  var WhControlCycle = mongoose.model('WhControlCycle');

  var filePathCache = {};

  app.broker.subscribe('directoryWatcher.changed', queueFile).setFilter(filterFile);

  app.broker.subscribe('warehouse.importQueue.transferOrders', importNext);

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

    app.broker.publish('warehouse.importQueue.push', {
      timestamp: fileInfo.timestamp,
      type: 'transferOrders',
      data: fileInfo
    });

    module.debug("Queued %s...", fileInfo.timeKey);
  }

  function importNext(fileInfo)
  {
    var startTime = Date.now();

    module.debug("Importing %s...", fileInfo.timeKey);

    importFile(fileInfo, function(err, transferOrders)
    {
      cleanUpFileInfoFile(fileInfo);

      if (err)
      {
        module.error("Failed to import %s: %s", fileInfo.timeKey, err.message);

        app.broker.publish('warehouse.transferOrders.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug("Imported %d of %s in %d ms!", transferOrders.length, fileInfo.timeKey, Date.now() - startTime);

        app.broker.publish('warehouse.transferOrders.synced', {
          timestamp: fileInfo.timestamp,
          count: transferOrders.length
        });
      }
    });
  }

  function importFile(fileInfo, done)
  {
    step(
      function fetchControlCyclesStep()
      {
        var next = this.next();
        var nc12ToS = this.nc12ToS = {};

        var stream = WhControlCycle.find({}, {s: 1}).lean().stream();

        stream.on('error', next);
        stream.on('end', next);
        stream.on('data', function(doc)
        {
          nc12ToS[doc._id] = doc.s;
        });
      },
      function readFileStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

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

        this.transferOrders = parseTransferOrders(fileContents, new Date(fileInfo.timestamp), this.nc12ToS);
        this.nc12ToS = null;

        module.debug("Parsed %s in %d ms!", fileInfo.timeKey, Date.now() - t);

        setImmediate(this.next());
      },
      function createBatchesStep()
      {
        var batchSize = 1000;
        var batchCount = Math.ceil(this.transferOrders.length / batchSize);

        this.batches = [];

        for (var i = 0; i < batchCount; ++i)
        {
          this.batches.push(this.transferOrders.slice(i * batchSize, i * batchSize + batchSize));
        }

        setImmediate(this.next());
      },
      function insertTransferOrdersStep()
      {
        for (var i = 0, l = this.batches.length; i < l; ++i)
        {
          WhTransferOrder.collection.insert(this.batches[i], {continueOnError: true}, this.parallel());
        }
      },
      function handleArchiveError(err)
      {
        if (!err || err.code === 11000)
        {
          return done(null, this.transferOrders);
        }

        if (err.err && !err.message)
        {
          var code = err.code;

          err = new Error(err.err);
          err.name = 'MongoError';
          err.code = code;
        }

        done(err, this.transferOrders);
      }
    );
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
