// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var step = require('h5.step');
var parseOrderInfo = require('./parseOrderInfo');
var parseOperInfo = require('./parseOperInfo');

module.exports = function createParser(app, module, filterRe, stepCount, callback)
{
  var LATE_DATA_PARSE_DELAY = 20 * 60 * 1000;
  var timeKeyToOrderInfoStepsMap = {};
  var timeKeyToOperInfoStepsMap = {};
  var filePathCache = {};
  var parseQueue = [];
  var parseDataTimers = {};
  var parseDataLock = false;

  app.broker.subscribe('directoryWatcher.changed', importFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    if (typeof filePathCache[fileInfo.filePath] === 'boolean')
    {
      return false;
    }

    var matches = fileInfo.fileName.match(filterRe);

    if (matches === null)
    {
      return false;
    }

    fileInfo.step = parseInt(matches[2], 10);
    fileInfo.type = matches[1].toUpperCase();
    fileInfo.timeKey = createTimeKey(fileInfo.timestamp);

    return true;
  }

  function importFile(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    var timeKeyToStepsMap = fileInfo.type === 'ORDER'
      ? timeKeyToOrderInfoStepsMap
      : timeKeyToOperInfoStepsMap;

    var timeKey = fileInfo.timeKey;
    var step = fileInfo.step;

    var stepsMap = timeKeyToStepsMap[timeKey];

    if (typeof stepsMap === 'undefined')
    {
      timeKeyToOrderInfoStepsMap[timeKey] = {steps: 0};
      timeKeyToOperInfoStepsMap[timeKey] = {steps: 0};

      stepsMap = timeKeyToStepsMap[timeKey];
    }

    if (typeof stepsMap[step] === 'undefined')
    {
      stepsMap.steps += 1;
    }

    stepsMap[step] = fileInfo;

    module.debug("Handling %d %s step for %s...", step, fileInfo.type, timeKey);

    if (timeKeyToOrderInfoStepsMap[timeKey].steps < stepCount
      || timeKeyToOperInfoStepsMap[timeKey].steps < stepCount)
    {
      if (typeof parseDataTimers[timeKey] !== 'undefined' && parseDataTimers[timeKey] !== null)
      {
        clearTimeout(parseDataTimers[timeKey]);
      }

      module.debug(
        "Delaying %s (order steps=%d operation steps=%d)...",
        timeKey,
        timeKeyToOrderInfoStepsMap[timeKey].steps,
        timeKeyToOperInfoStepsMap[timeKey].steps
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
      module.debug("Queued %s (delayed)...", timeKey);
    }
    else
    {
      module.debug("Queued %s...", timeKey);
    }

    parseQueue.push(timeKey);
    parseData();
  }

  function parseData()
  {
    if (parseDataLock)
    {
      return;
    }

    var timeKey = parseQueue.shift();

    if (typeof timeKey === 'undefined')
    {
      return;
    }

    var startTime = Date.now();

    module.debug("Parsing %s...", timeKey);

    parseDataLock = true;

    var orderFileInfoStepsMap = timeKeyToOrderInfoStepsMap[timeKey];
    var operFileInfoStepsMap = timeKeyToOperInfoStepsMap[timeKey];

    delete timeKeyToOrderInfoStepsMap[timeKey];
    delete timeKeyToOperInfoStepsMap[timeKey];

    parseOrderInfoSteps(orderFileInfoStepsMap, operFileInfoStepsMap, function(orders, missingOrders)
    {
      parseDataLock = false;

      var filePaths = collectFileInfoPaths([orderFileInfoStepsMap, operFileInfoStepsMap]);

      deleteFileInfoStepFiles(filePaths);

      setTimeout(removeFilePathsFromCache, 15000, filePaths);

      module.debug("Parsed %s in %d ms!", timeKey, Date.now() - startTime);

      setImmediate(parseData);

      callback(orders, missingOrders);
    });
  }

  function parseOrderInfoSteps(orderFileInfoSteps, operFileInfoSteps, done)
  {
    var orders = {};
    var steps = [];

    for (var i = 1; i <= stepCount; ++i)
    {
      if (typeof orderFileInfoSteps[i] === 'undefined')
      {
        module.debug("Missing orders step %d :(", i);
      }
      else
      {
        steps.push(createParseOrderInfoStep(orders, orderFileInfoSteps[i]));
      }
    }

    steps.push(function parseOperInfoStepsStep()
    {
      setImmediate(parseOperInfoSteps.bind(null, orders, operFileInfoSteps, done));
    });

    step(steps);
  }

  function parseOperInfoSteps(orders, operFileInfoSteps, done)
  {
    var missingOrders = {};
    var steps = [];

    for (var i = 1; i <= stepCount; ++i)
    {
      if (typeof operFileInfoSteps[i] === 'undefined')
      {
        module.debug("Missing operations step %d :(", i);
      }
      else
      {
        steps.push(createParseOperInfoStep(orders, missingOrders, operFileInfoSteps[i]));
      }
    }

    steps.push(done.bind(null, orders, missingOrders));

    step(steps);
  }

  function createParseOrderInfoStep(orders, orderFileInfo)
  {
    return function parseOrderInfoStep()
    {
      var next = this.next();

      fs.readFile(orderFileInfo.filePath, 'utf8', function(err, orderInfoHtml)
      {
        if (err)
        {
          module.error(
            "Failed to read order info file `%s`: %s", orderFileInfo.filePath, err.message
          );
        }
        else
        {
          parseOrderInfo(orderInfoHtml, orders, new Date(orderFileInfo.timestamp));
        }

        next();
      });
    };
  }

  function createParseOperInfoStep(orders, missingOrders, operFileInfo)
  {
    return function parseOperInfoStep()
    {
      var next = this.next();

      fs.readFile(operFileInfo.filePath, 'utf8', function(err, operInfoHtml)
      {
        if (err)
        {
          module.error(
            "Failed to read oper info file `%s`: %s", operFileInfo.filePath, err.message
          );
        }
        else
        {
          parseOperInfo(operInfoHtml, orders, missingOrders, new Date(operFileInfo.timestamp));
        }

        next();
      });
    };
  }

  function createTimeKey(timestamp)
  {
    var date = new Date(timestamp);
    var timeKey = '';

    timeKey += date.getUTCFullYear();
    timeKey += (date.getUTCMonth() < 9 ? '0' : '') + (date.getUTCMonth() + 1);
    //TODO: Need better time key
    //timeKey += (date.getUTCDate() < 10 ? '0' : '') + date.getUTCDate();
    //timeKey += (date.getUTCHours() < 10 ? '0' : '') + date.getUTCHours();

    return timeKey;
  }

  function collectFileInfoPaths(fileInfoMaps)
  {
    var filePaths = [];

    fileInfoMaps.forEach(function(fileInfoMap)
    {
      Object.keys(fileInfoMap).forEach(function(key)
      {
        if (key !== 'steps')
        {
          filePaths.push(fileInfoMap[key].filePath);
        }
      });
    });

    return filePaths;
  }

  function deleteFileInfoStepFiles(filePaths)
  {
    filePaths.forEach(function(filePath)
    {
      if (module.config.parsedOutputDir)
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

  function deleteFileInfoStepFile(filePath)
  {
    fs.unlink(filePath, function(err)
    {
      if (err)
      {
        module.error("Failed to delete file [%s]: %s", filePath, err.message);
      }
    });
  }

  function removeFilePathsFromCache(filePaths)
  {
    filePaths.forEach(function(filePath)
    {
      delete filePathCache[filePath];
    });
  }
};
