// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
const fs = require('fs-extra');
const comparePoList = require('./comparePoList');
const parsers = {
  html: require('./parseHtmlPoList'),
  text: require('./parseTextPoList'),
  json: require('./parseJsonPoList')
};

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  lateDataDelay: 10 * 60 * 1000,
  parsedOutputDir: null,
  parsers: [
    {
      type: 'html',
      filterRe: /^Job .*?_OPEN_PO_D, Step ([0-9]+)\.html?$/,
      stepCount: 1,
      hourlyInterval: 3
    },
    {
      type: 'text',
      filterRe: /^OPEN_PO_([0-9]+)\.txt$/,
      stepCount: 1,
      hourlyInterval: 3
    },
    {
      type: 'json',
      filterRe: /^OPEN_PO_([0-9]+)\.json$/,
      stepCount: 1,
      hourlyInterval: 3
    }
  ]
};

exports.start = function startPurchaseOrdersImporterModule(app, module)
{
  const mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error('mongoose module is required!');
  }

  const filePathCache = {};
  const timeKeyToStepsMap = {};
  const importQueue = [];
  const importTimers = {};
  let importLock = false;
  let restarting = false;

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

    for (let i = 0, l = module.config.parsers.length; i < l; ++i)
    {
      const parserInfo = module.config.parsers[i];
      const parser = parsers[parserInfo.type];

      if (!parser)
      {
        module.warn('Unknown parser: %s', parserInfo.type);

        continue;
      }

      const matches = fileInfo.fileName.match(parserInfo.filterRe);

      if (matches !== null)
      {
        fileInfo.parser = parserInfo.parser || parser;
        fileInfo.stepCount = parserInfo.stepCount;
        fileInfo.step = parseInt(matches[1], 10) || 1;
        fileInfo.timeKey = createTimeKey(fileInfo.timestamp, parserInfo.hourlyInterval);
        fileInfo.hourlyInterval = parserInfo.hourlyInterval;

        return true;
      }
    }

    return false;
  }

  function createTimeKey(timestamp, hourlyInterval)
  {
    const date = new Date(timestamp);
    const hours = Math.floor(date.getHours() / hourlyInterval) * hourlyInterval;
    let timeKey = '';

    timeKey += date.getFullYear();
    timeKey += (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
    timeKey += (date.getDate() < 10 ? '0' : '') + date.getDate();
    timeKey += (hours < 10 ? '0' : '') + hours;

    return timeKey;
  }

  function importFile(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    const timeKey = fileInfo.timeKey;
    const step = fileInfo.step;

    let stepsMap = timeKeyToStepsMap[timeKey];

    if (stepsMap === undefined)
    {
      stepsMap = timeKeyToStepsMap[timeKey] = {steps: 0};
    }

    if (stepsMap[step] === undefined)
    {
      stepsMap.steps += 1;
    }

    stepsMap[step] = fileInfo;

    module.debug('Handling %d step for %s...', step, timeKey);

    if (stepsMap.steps < fileInfo.stepCount)
    {
      if (typeof importTimers[timeKey] !== 'undefined' && importTimers[timeKey] !== null)
      {
        clearTimeout(importTimers[timeKey]);
      }

      const delay = createTimeKey(Date.now(), fileInfo.hourlyInterval) === timeKey
        ? module.config.lateDataDelay
        : 60000;

      module.debug('Delaying %s by %d ms (steps=%d)...', timeKey, delay, stepsMap.steps);

      importTimers[timeKey] = setTimeout(enqueueAndImport, delay, timeKey, true);

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
      module.debug('Queued %s (delayed)...', timeKey);
    }
    else
    {
      module.debug('Queued %s...', timeKey);
    }

    importQueue.push(timeKey);

    importNext();
  }

  function importNext()
  {
    if (importLock || !importQueue.length || restarting)
    {
      return;
    }

    importQueue.sort(function(a, b) { return a - b; });

    if (isWaitingForEarlierData(importQueue[0], Object.keys(importTimers)))
    {
      return module.debug('Delayed %s: waiting for earlier data...', importQueue[0]);
    }

    const startTime = Date.now();
    const timeKey = importQueue.shift();
    const stepsMap = timeKeyToStepsMap[timeKey];

    if (!stepsMap)
    {
      return setImmediate(importNext);
    }

    delete timeKeyToStepsMap[timeKey];

    importLock = true;

    importSteps(stepsMap, function(purchaseOrders)
    {
      const filePaths = collectFileInfoPaths(stepsMap);

      deleteFileInfoStepFiles(filePaths);

      setTimeout(removeFilePathsFromCache, 15000, filePaths);

      module.debug('Imported %s in %d ms!', timeKey, Date.now() - startTime);

      importLock = false;

      setImmediate(importNext);

      createVendors(purchaseOrders);
    });
  }

  function importSteps(stepsMap, done)
  {
    const purchaseOrders = {};
    const steps = [];
    const stepCount = stepsMap[Object.keys(stepsMap)[0]].stepCount;

    for (let i = 1; i <= stepCount; ++i)
    {
      if (stepsMap[i] === undefined)
      {
        module.debug('Missing step %d :(', i);
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
      const importedAt = new Date(fileInfo.timestamp);

      module.debug(
        'Parsing step [%d] received at [%s]...',
        fileInfo.step,
        app.formatDateTime(importedAt)
      );

      const next = this.next();

      fs.readFile(fileInfo.filePath, 'utf8', function(err, contents)
      {
        if (err)
        {
          module.error('Failed to read step file [%s]: %s', fileInfo.filePath, err.message);
        }
        else
        {
          fileInfo.parser(contents, importedAt, purchaseOrders);
        }

        next();
      });
    };
  }

  function collectFileInfoPaths(fileInfoMap)
  {
    const filePaths = [];

    _.forEach(fileInfoMap, function(fileInfo, key)
    {
      if (key !== 'steps')
      {
        filePaths.push(fileInfo.filePath);
      }
    });

    return filePaths;
  }

  function deleteFileInfoStepFiles(filePaths)
  {
    _.forEach(filePaths, function(filePath)
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
    const newFilePath = path.join(module.config.parsedOutputDir, path.basename(oldFilePath));

    fs.move(oldFilePath, newFilePath, {overwrite: true}, function(err)
    {
      if (err)
      {
        module.error(
          'Failed to rename file [%s] to [%s]: %s', oldFilePath, newFilePath, err.message
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
        module.error('Failed to delete file [%s]: %s', filePath, err.message);
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

  function createVendors(purchaseOrders)
  {
    const vendorMap = {};

    _.forEach(purchaseOrders, function(po)
    {
      vendorMap[po.vendor] = po.vendorName;
    });

    const vendorList = [];

    _.forEach(vendorMap, function(vendorName, vendorId)
    {
      vendorList.push({
        _id: vendorId,
        name: vendorName
      });
    });

    if (!vendorList.length)
    {
      return;
    }

    mongoose.model('Vendor').collection.insertMany(vendorList, {ordered: false}, function() {});
  }

  function isWaitingForEarlierData(timeKey, waitingTimeKeys)
  {
    for (let i = 0, l = waitingTimeKeys.length; i < l; ++i)
    {
      if (waitingTimeKeys[i] < timeKey)
      {
        return true;
      }
    }

    return false;
  }
};
