// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var moment = require('moment');
var step = require('h5.step');
var fs = require('fs-extra');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_ZLF1\.json$/,
  parsedOutputDir: null
};

exports.start = function startOrderZlf1ImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("orders/importer/zlf1 module requires the mongoose module!");
  }

  var OrderZlf1 = mongoose.model('OrderZlf1');

  var filePathCache = {};
  var locked = false;
  var queue = [];

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

    module.debug("[%s] Queued...", fileInfo.timeKey);

    setImmediate(importNext);
  }

  function importNext()
  {
    if (locked)
    {
      return;
    }

    var fileInfo = queue.shift();

    if (!fileInfo)
    {
      return;
    }

    locked = true;

    var startTime = Date.now();

    module.debug("[%s] Importing...", fileInfo.timeKey);

    importFile(fileInfo, function(err, count)
    {
      cleanUpFileInfoFile(fileInfo);

      if (err)
      {
        module.error("[%s] Failed to import: %s", fileInfo.timeKey, err.message);

        app.broker.publish('orders.zlf1.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug("[%s] Imported %d in %d ms", fileInfo.timeKey, count, Date.now() - startTime);

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

        module.debug("[%s] Parsing ~%d bytes...", fileInfo.timeKey, fileContents.length);

        var t = Date.now();

        try
        {
          this.orders = JSON.parse(fileContents);
        }
        catch (err)
        {
          this.orders = [];

          return this.skip(err);
        }

        module.debug("[%s] Parsed %d items in %d ms!", fileInfo.timeKey, this.orders.length, Date.now() - t);

        setImmediate(this.next());
      },
      function upsertOrdersStep()
      {
        module.debug("[%s] Upserting orders...", fileInfo.timeKey);

        var t = Date.now();

        upsertNextOrderBatch(this.orders, 0, 10, this.next());

        function upsertNextOrderBatch(orders, batchNo, batchSize, done)
        {
          var startIndex = batchNo * batchSize;
          var endIndex = Math.min(startIndex + batchSize, orders.length);

          step(
            function()
            {
              for (var i = startIndex; i < endIndex; ++i)
              {
                var orderZlf1 = OrderZlf1.prepareForInsert(orders[i]);

                if (!orderZlf1._id)
                {
                  continue;
                }

                OrderZlf1.update(
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
                module.error("Failed to upsert order: %s", err.message);
              }

              if (endIndex === orders.length)
              {
                module.debug(
                  "[%s] Upserted %d orders in %d ms!", fileInfo.timeKey, orders.length, Date.now() - t
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
    var newFilePath = path.join(module.config.parsedOutputDir, path.basename(oldFilePath));

    fs.move(oldFilePath, newFilePath, {clobber: true}, function(err)
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
