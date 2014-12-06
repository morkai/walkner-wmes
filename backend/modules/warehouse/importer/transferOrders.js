// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

  var WhTransferOrderArchive = mongoose.model('WhTransferOrderArchive');

  var filePathCache = {};
  var importQueue = [];
  var importLock = false;

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
    if (importLock || !importQueue.length)
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

    importFile(fileInfo, function(err, transferOrders)
    {
      cleanUpFileInfoFile(fileInfo);

      if (err)
      {
        module.error("Failed to import %s: %s", fileInfo.timeKey, err.message);
      }
      else
      {
        module.debug("Imported %d of %s in %d ms!", transferOrders.length, fileInfo.timeKey, Date.now() - startTime);
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

        this.transferOrders = parseTransferOrders(fileContents, new Date(fileInfo.timestamp));

        module.debug("Parsed %s in %d ms!", fileInfo.timeKey, Date.now() - t);

        setImmediate(this.next());
      },
      function archiveControlCyclesStep()
      {
        WhTransferOrderArchive.collection.insert(this.transferOrders, {continueOnError: true}, this.next());
      },
      function handleError(err)
      {
        if (err)
        {
          var code = err.code;

          if (err.code === 11000)
          {
            err = null;
          }
          else if (err.errmsg)
          {
            err = new Error(err.errmsg);
            err.name = 'MongoError';
            err.code = code;
          }
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
