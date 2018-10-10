// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const moment = require('moment');
const step = require('h5.step');
const deepEqual = require('deep-equal');
const fs = require('fs-extra');
const parseSapTextTable = require('../../sap/util/parseSapTextTable');
const parseSapNumber = require('../../sap/util/parseSapNumber');
const parseSapString = require('../../sap/util/parseSapString');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_PKHD\.txt$/,
  parsedOutputDir: null
};

exports.start = function startOrderPkhdImporterModule(app, module)
{
  const mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error('orders/importer/pkhd module requires the mongoose module!');
  }

  const PkhdComponent = mongoose.model('PkhdComponent');

  const filePathCache = {};
  let locked = false;
  const queue = [];

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
    return moment(timestamp).format('YYMMDDHH');
  }

  function queueFile(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    queue.push(fileInfo);

    module.debug('[%s] Queued...', fileInfo.timeKey);

    setImmediate(importNext);
  }

  function importNext()
  {
    if (locked)
    {
      return;
    }

    const fileInfo = queue.shift();

    if (!fileInfo)
    {
      return;
    }

    locked = true;

    const startTime = Date.now();

    module.debug('[%s] Importing...', fileInfo.timeKey);

    importFile(fileInfo, function(err, count)
    {
      cleanUpFileInfoFile(fileInfo);

      if (err)
      {
        module.error('[%s] Failed to import: %s', fileInfo.timeKey, err.message);

        app.broker.publish('orders.pkhd.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug('[%s] Imported %d in %d ms', fileInfo.timeKey, count, Date.now() - startTime);

        app.broker.publish('orders.pkhd.synced', {
          timestamp: fileInfo.timestamp,
          count
        });
      }

      locked = false;

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

        module.debug('[%s] Parsing ~%d bytes...', fileInfo.timeKey, fileContents.length);

        this.items = new Map();

        const t = Date.now();

        parseTable(fileContents, this.items);

        module.debug('[%s] Parsed %d items in %d ms!', fileInfo.timeKey, this.items.size, Date.now() - t);

        setImmediate(this.next());
      },
      function updateStep()
      {
        module.debug('[%s] Updating...', fileInfo.timeKey);

        updateNext(fileInfo, new Date(), Array.from(this.items.keys()), this.items, this.next());
      },
      function finalizeStep(err)
      {
        return done(err, this.items.size);
      }
    );
  }

  function updateNext(fileInfo, t, keys, items, done)
  {
    const operations = keys.splice(0, 20).map(key =>
    {
      const item = items.get(key);

      return {
        updateOne: {
          filter: {_id: item._id},
          update: {$set: item},
          upsert: true
        }
      };
    });

    PkhdComponent.collection.bulkWrite(operations, {ordered: false}, err =>
    {
      if (err)
      {
        module.error('[%s] Failed update: %s', fileInfo.timeKey, err.message);
      }

      if (keys.length)
      {
        return setImmediate(updateNext, fileInfo, t, keys, items, done);
      }

      setImmediate(done);
    });
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
    const newFilePath = path.join(module.config.parsedOutputDir, path.basename(oldFilePath));

    fs.move(oldFilePath, newFilePath, {overwrite: true}, err =>
    {
      if (err)
      {
        module.error(
          'Failed to rename file [%s] to [%s]: %s', oldFilePath, newFilePath, err.message
        );
      }
    });
  }

  function deleteFileInfoFile(filePath)
  {
    fs.unlink(filePath, err =>
    {
      if (err)
      {
        module.error('Failed to delete file [%s]: %s', filePath, err.message);
      }
    });
  }

  function removeFilePathFromCache(filePath)
  {
    delete filePathCache[filePath];
  }

  function parseTable(input, items)
  {
    parseSapTextTable(input, {
      columnMatchers: {
        nc12: /^Material$/,
        supplyArea: /^Sup.*?Area/,
        msi: /^S$/,
        storageType: /Typ/
      },
      valueParsers: {
        nc12: input => input.replace(/^(0|[A-Z])+/, ''),
        supplyArea: parseSapString,
        msi: parseSapNumber,
        storageType: parseSapNumber
      },
      itemDecorator: obj =>
      {
        if (!obj.nc12.length || !obj.supplyArea.length)
        {
          return;
        }

        items.set(`${obj.nc12}:${obj.supplyArea}`, {
          _id: {
            nc: obj.nc12,
            sa: obj.supplyArea
          },
          s: obj.msi < 0 ? 0 : obj.msi,
          t: obj.storageType < 0 ? 0 : obj.storageType
        });
      }
    });
  }
};