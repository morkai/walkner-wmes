// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const moment = require('moment');
const step = require('h5.step');
const fs = require('fs-extra');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_ZLF1\.json$/,
  parsedOutputDir: null
};

exports.start = function startOrderZlf1ImporterModule(app, module)
{
  const mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error('orders/importer/zlf1 module requires the mongoose module!');
  }

  const OrderZlf1 = mongoose.model('OrderZlf1');

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

        app.broker.publish('orders.zlf1.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug('[%s] Imported %d in %d ms', fileInfo.timeKey, count, Date.now() - startTime);

        app.broker.publish('orders.zlf1.synced', {
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

        const t = Date.now();

        try
        {
          this.orders = JSON.parse(fileContents);
        }
        catch (err)
        {
          this.orders = [];

          return this.skip(err);
        }

        module.debug('[%s] Parsed %d items in %d ms!', fileInfo.timeKey, this.orders.length, Date.now() - t);

        setImmediate(this.next());
      },
      function upsertOrdersStep()
      {
        if (this.orders.length === 0)
        {
          return this.skip();
        }

        module.debug('[%s] Upserting orders...', fileInfo.timeKey);

        const t = Date.now();

        upsertNextOrderBatch(this.orders, 0, 10, this.next());

        function upsertNextOrderBatch(orders, batchNo, batchSize, done)
        {
          const startIndex = batchNo * batchSize;
          const endIndex = Math.min(startIndex + batchSize, orders.length);

          step(
            function()
            {
              for (let i = startIndex; i < endIndex; ++i)
              {
                const orderZlf1 = OrderZlf1.prepareForInsert(orders[i]);

                if (!orderZlf1._id)
                {
                  continue;
                }

                OrderZlf1.replaceOne(
                  {_id: orderZlf1._id},
                  orderZlf1,
                  {upsert: true},
                  this.group()
                );
              }
            },
            function(err)
            {
              if (err)
              {
                module.error('Failed to upsert order: %s', err.message);
              }

              if (endIndex === orders.length)
              {
                module.debug(
                  '[%s] Upserted %d orders in %d ms!', fileInfo.timeKey, orders.length, Date.now() - t
                );

                return done();
              }

              return setImmediate(upsertNextOrderBatch, orders, batchNo + 1, batchSize, done);
            }
          );
        }
      },
      function finalizeStep(err)
      {
        return done(err, this.orders.length);
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
};
