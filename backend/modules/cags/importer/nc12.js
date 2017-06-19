// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const moment = require('moment');
const step = require('h5.step');
const fs = require('fs-extra');
const parseSapTextTable = require('../../sap/util/parseSapTextTable');

exports.DEFAULT_CONFIG = {
  filterRe: /^T_ZSE16D_MARA\.txt$/,
  resultFile: 'nc12_to_cags.json',
  parsedOutputDir: null
};

exports.start = function startCagNc12ImporterModule(app, module)
{
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
    return moment(timestamp).subtract(1, 'days').format('YYMMDDHH');
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

        app.broker.publish('cags.nc12.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug('[%s] Imported %d in %d ms', fileInfo.timeKey, count, Date.now() - startTime);

        app.broker.publish('cags.nc12.synced', {
          timestamp: fileInfo.timestamp,
          count: count
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

        const nc12ToCag = {};
        const t = Date.now();

        this.count = parseNc12ToCagTable(fileContents, nc12ToCag);

        module.debug('[%s] Parsed %d items in %d ms!', fileInfo.timeKey, this.count, Date.now() - t);

        setImmediate(this.next(), nc12ToCag);
      },
      function writeResultFileStep(nc12ToCag)
      {
        fs.writeFile(module.config.resultFile, JSON.stringify(nc12ToCag), this.next());
      },
      function finalizeStep(err)
      {
        return done(err, this.count);
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

  function deleteFileInfoFile(filePath)
  {
    fs.unlink(filePath, function(err)
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

  function parseNc12ToCagTable(input, nc12ToCag)
  {
    let count = 0;

    parseSapTextTable(input, {
      columnMatchers: {
        nc12: /^Material$/,
        cag: /^Prod.*?Hier/i
      },
      valueParsers: {
        nc12: function(input) { return input.replace(/^0+/, ''); },
        cag: function(input) { return input.substr(-6); }
      },
      itemDecorator: function(obj)
      {
        ++count;

        if (obj.nc12.length === 12 && obj.cag.length === 6)
        {
          nc12ToCag[obj.nc12] = obj.cag;
        }

        return null;
      }
    });

    return count;
  }
};
