// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var fs = require('fs-extra');
var parseOrders = require('./parseOrders');
var parseOperations = require('./parseOperations');

module.exports = function createParser(app, importerModule, callback)
{
  var LATE_DATA_PARSE_DELAY = 20 * 60 * 1000;
  var timeKeyToFileInfoMap = {};
  var filePathCache = {};
  var parseQueue = [];
  var parseDataTimers = {};
  var parseDataLock = false;
  var restarting = false;

  app.broker.subscribe('updater.restarting', function()
  {
    restarting = true;
  });

  app.broker.subscribe('directoryWatcher.changed', importFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    if (filePathCache[fileInfo.filePath])
    {
      return false;
    }

    var matches = fileInfo.fileName.match(importerModule.config.filterRe);

    if (matches === null)
    {
      return false;
    }

    fileInfo.step = parseInt(matches[2], 10) || 0;
    fileInfo.type = /OPER/i.test(matches[1]) ? 'OPERS' : 'ORDERS';
    fileInfo.timeKey = createTimeKey(fileInfo.timestamp);

    return true;
  }

  function importFile(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    var timeKey = fileInfo.timeKey;
    var timeKeyFileInfo = timeKeyToFileInfoMap[timeKey];

    if (typeof timeKeyFileInfo === 'undefined')
    {
      timeKeyToFileInfoMap[timeKey] = {
        orders: null,
        operations: null
      };

      timeKeyFileInfo = timeKeyToFileInfoMap[timeKey];
    }

    if (fileInfo.type === 'ORDERS')
    {
      timeKeyFileInfo.orders = fileInfo;
    }
    else
    {
      timeKeyFileInfo.operations = fileInfo;
    }

    importerModule.debug("Handling %s for %s...", fileInfo.type, timeKey);

    if (timeKeyFileInfo.orders === null || timeKeyFileInfo.operations === null)
    {
      if (typeof parseDataTimers[timeKey] !== 'undefined' && parseDataTimers[timeKey] !== null)
      {
        clearTimeout(parseDataTimers[timeKey]);
      }

      importerModule.debug(
        "Delaying %s (orders=%s operations=%s)...",
        timeKey,
        timeKeyFileInfo.orders !== null,
        timeKeyFileInfo.operations !== null
      );

      parseDataTimers[timeKey] = setTimeout(enqueueAndParse, LATE_DATA_PARSE_DELAY, timeKey, true);

      return;
    }

    enqueueAndParse(timeKey, false);
  }

  function enqueueAndParse(timeKey, delayed)
  {
    if (parseDataTimers[timeKey] !== null)
    {
      clearTimeout(parseDataTimers[timeKey]);
      delete parseDataTimers[timeKey];
    }

    if (delayed)
    {
      importerModule.debug("Queued %s (delayed)...", timeKey);
    }
    else
    {
      importerModule.debug("Queued %s...", timeKey);
    }

    parseQueue.push(timeKey);
    parseData();
  }

  function parseData()
  {
    if (parseDataLock || restarting)
    {
      return;
    }

    var timeKey = parseQueue.shift();

    if (typeof timeKey === 'undefined')
    {
      return;
    }

    var startTime = Date.now();

    importerModule.debug("Parsing %s...", timeKey);

    parseDataLock = true;

    var timeKeyFileInfo = timeKeyToFileInfoMap[timeKey];

    delete timeKeyToFileInfoMap[timeKey];

    parseOrdersAndOperations(timeKeyFileInfo.orders, timeKeyFileInfo.operations, function(err, orders, missingOrders)
    {
      parseDataLock = false;

      var filePaths = collectFileInfoPaths(timeKeyFileInfo);

      deleteFileInfoStepFiles(filePaths);
      setTimeout(removeFilePathsFromCache, 15000, filePaths);

      importerModule.debug("Parsed %s in %d ms!", timeKey, Date.now() - startTime);

      setImmediate(parseData);

      callback(null, orders, missingOrders);
    });
  }

  function parseOrdersAndOperations(ordersFileInfo, operationsFileInfo, done)
  {
    var orders = {};
    var missingOrders = {};

    step(
      function readOrdersFileStep()
      {
        if (ordersFileInfo)
        {
          fs.readFile(ordersFileInfo.filePath, 'utf8', this.next());
        }
        else
        {
          setImmediate(this.next(), null, '');
        }
      },
      function parseOrdersStep(err, ordersFileContents)
      {
        if (err)
        {
          importerModule.error("Failed to read the orders input file: %s", err.message);
        }
        else if (ordersFileInfo)
        {
          parseOrders(
            ordersFileContents,
            orders,
            ordersFileInfo.timestamp ? new Date(ordersFileInfo.timestamp) : new Date()
          );
        }
      },
      function readOperationsFileStep()
      {
        if (operationsFileInfo)
        {
          fs.readFile(operationsFileInfo.filePath, 'utf8', this.next());
        }
        else
        {
          setImmediate(this.next(), null, '');
        }
      },
      function parseOperationsStep(err, operationsFileContents)
      {
        if (err)
        {
          importerModule.error("Failed to read the operations input file: %s", err.message);
        }
        else if (operationsFileInfo)
        {
          parseOperations(
            operationsFileContents,
            orders,
            missingOrders,
            operationsFileInfo.timestamp ? new Date(operationsFileInfo.timestamp) : new Date()
          );
        }
      },
      function()
      {
        setImmediate(done, null, orders, missingOrders);
      }
    );
  }

  function createTimeKey(timestamp)
  {
    return moment(timestamp || Date.now()).format('YYYYMMDDHH');
  }

  function collectFileInfoPaths(timeKeyFileInfo)
  {
    var filePaths = [];

    if (timeKeyFileInfo.orders)
    {
      filePaths.push(timeKeyFileInfo.orders.filePath);
    }

    if (timeKeyFileInfo.operations)
    {
      filePaths.push(timeKeyFileInfo.operations.filePath);
    }

    return filePaths;
  }

  function deleteFileInfoStepFiles(filePaths)
  {
    _.forEach(filePaths, function(filePath)
    {
      if (importerModule.config.parsedOutputDir)
      {
        moveFileInfoStepFile(filePath);
      }
      else
      {
        deleteFileInfoStepFile(filePath);
      }
    });
  }

  function moveFileInfoStepFile(oldFilePath)
  {
    var newFilePath = path.join(importerModule.config.parsedOutputDir, path.basename(oldFilePath));

    fs.move(oldFilePath, newFilePath, {overwrite: true}, function(err)
    {
      if (err)
      {
        importerModule.error(
          "Failed to rename file [%s] to [%s]: %s", oldFilePath, newFilePath, err.message
        );
      }
    });
  }

  function deleteFileInfoStepFile(filePath)
  {
    fs.unlink(filePath, function(err)
    {
      if (err)
      {
        importerModule.error("Failed to delete file [%s]: %s", filePath, err.message);
      }
    });
  }

  function removeFilePathsFromCache(filePaths)
  {
    _.forEach(filePaths, function(filePath)
    {
      delete filePathCache[filePath];
    });
  }
};
