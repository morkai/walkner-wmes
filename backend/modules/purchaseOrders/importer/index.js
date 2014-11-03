// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var step = require('h5.step');
var parsePoList = require('./parsePoList');
var comparePoList = require('./comparePoList');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^Job .*?_OPEN_PO_D, Step ([0-9]+)\.html?$/,
  stepCount: 1,
  lateDataDelay: 10 * 60 * 1000,
  hourlyInterval: 3,
  parsedOutputDir: null
};

exports.start = function startPurchaseOrdersImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var filePathCache = {};
  var timeKeyToStepsMap = {};
  var importQueue = [];
  var importTimers = {};
  var importLock = false;

  app.broker.subscribe('directoryWatcher.changed', importFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    if (filePathCache[fileInfo.filePath])
    {
      return;
    }

    var matches = fileInfo.fileName.match(module.config.filterRe);

    if (matches === null)
    {
      return false;
    }

    fileInfo.step = parseInt(matches[1], 10);
    fileInfo.timeKey = createTimeKey(fileInfo.timestamp);

    return true;
  }

  function createTimeKey(timestamp)
  {
    var date = new Date(timestamp);
    var hours = Math.floor(date.getHours() / module.config.hourlyInterval) * module.config.hourlyInterval;
    var timeKey = '';

    timeKey += date.getFullYear();
    timeKey += (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
    timeKey += (date.getDate() < 10 ? '0' : '') + date.getDate();
    timeKey += (hours < 10 ? '0' : '') + hours;

    return timeKey;
  }

  function importFile(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    var timeKey = fileInfo.timeKey;
    var step = fileInfo.step;

    var stepsMap = timeKeyToStepsMap[timeKey];

    if (stepsMap === undefined)
    {
      stepsMap = timeKeyToStepsMap[timeKey] = {steps: 0};
    }

    if (stepsMap[step] === undefined)
    {
      stepsMap.steps += 1;
    }

    stepsMap[step] = fileInfo;

    module.debug("Handling %d step for %s...", step, timeKey);

    if (stepsMap.steps < module.config.stepCount)
    {
      if (typeof importTimers[timeKey] !== 'undefined' && importTimers[timeKey] !== null)
      {
        clearTimeout(importTimers[timeKey]);
      }

      module.debug("Delaying %s (steps=%d)...", timeKey, stepsMap.steps);

      importTimers[timeKey] = setTimeout(
        enqueueAndImport,
        createTimeKey(Date.now()) === timeKey ? module.config.lateDataDelay : 1337,
        timeKey,
        true
      );

      return;
    }

    enqueueAndImport(timeKey, false);
  }

  function enqueueAndImport(timeKey, delayed)
  {
    if (importTimers[timeKey] !== null)
    {
      clearTimeout(importTimers[timeKey]);
      delete importTimers[timeKey];
    }

    if (delayed)
    {
      module.debug("Queued %s (delayed)...", timeKey);
    }
    else
    {
      module.debug("Queued %s...", timeKey);
    }

    importQueue.push(timeKey);

    importNext();
  }

  function importNext()
  {
    if (importLock || !importQueue.length)
    {
      return;
    }

    importLock = true;

    var startTime = Date.now();
    var timeKey = importQueue.shift();
    var stepsMap = timeKeyToStepsMap[timeKey];

    delete timeKeyToStepsMap[timeKey];

    importSteps(stepsMap, function(purchaseOrders)
    {
      var filePaths = collectFileInfoPaths(stepsMap);

      deleteFileInfoStepFiles(filePaths);

      setTimeout(removeFilePathsFromCache, 15000, filePaths);

      module.debug("Imported %s in %d ms!", timeKey, Date.now() - startTime);

      importLock = false;

      setImmediate(importNext);

      createVendors(purchaseOrders);
    });
  }

  function importSteps(stepsMap, done)
  {
    var purchaseOrders = {};
    var steps = [];

    for (var i = 1, l = module.config.stepCount; i <= l; ++i)
    {
      if (stepsMap[i] === undefined)
      {
        module.debug("Missing step %d :(", i);
      }
      else
      {
        steps.push(createParseStep(purchaseOrders, stepsMap[i]));
      }
    }

    steps.push(function comparePoListStep()
    {
      comparePoList(app, module, purchaseOrders, this.next());
    });

    steps.push(function finalizeStep()
    {
      done(purchaseOrders);
    });

    step(steps);
  }

  function createParseStep(purchaseOrders, fileInfo)
  {
    return function parseStep()
    {
      var importedAt = new Date(fileInfo.timestamp);

      module.debug(
        "Parsing step [%d] received at [%s]...",
        fileInfo.step,
        moment(importedAt).format('YYYY-MM-DD HH:mm:ss')
      );

      var next = this.next();

      fs.readFile(fileInfo.filePath, 'utf8', function(err, html)
      {
        if (err)
        {
          module.error("Failed to read step file [%s]: %s", fileInfo.filePath, err.message);
        }
        else
        {
          parsePoList(html, importedAt, purchaseOrders);
        }

        next();
      });
    };
  }

  function collectFileInfoPaths(fileInfoMap)
  {
    var filePaths = [];

    Object.keys(fileInfoMap).forEach(function(key)
    {
      if (key !== 'steps')
      {
        filePaths.push(fileInfoMap[key].filePath);
      }
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

  function createVendors(purchaseOrders)
  {
    var vendorMap = {};

    Object.keys(purchaseOrders).forEach(function(key)
    {
      var po = purchaseOrders[key];

      vendorMap[po.vendor] = po.vendorName;
    });

    var vendorList = [];

    Object.keys(vendorMap).forEach(function(vendorId)
    {
      vendorList.push({
        _id: vendorId,
        name: vendorMap[vendorId]
      });
    });

    mongoose.model('Vendor').collection.insert(vendorList, {continueOnError: true}, function() {});
  }
};
