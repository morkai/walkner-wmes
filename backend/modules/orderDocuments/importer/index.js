// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var deepEqual = require('deep-equal');
var moment = require('moment');
var step = require('h5.step');
var parseOrderDocuments = require('./parseOrderDocuments');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_COOIS_DOCS\.txt$/,
  parsedOutputDir: null
};

exports.start = function startOrderDocumentsImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var Order = mongoose.model('Order');

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
    return moment(timestamp).subtract(1, 'days').format('YYMMDDHH');
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

    importFile(fileInfo, function(err, summary)
    {
      cleanUpFileInfoFile(fileInfo);

      if (err)
      {
        module.error("[%s] Failed to import: %s", fileInfo.timeKey, err.message);

        app.broker.publish('order.documents.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug("[%s] Imported in %d ms: %s", fileInfo.timeKey, Date.now() - startTime, JSON.stringify(summary));

        app.broker.publish('order.documents.synced', {
          timestamp: fileInfo.timestamp,
          updateCount: summary.updateCount
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

        this.parsedOrderDocumentsList = parseOrderDocuments(fileContents);

        module.debug(
          "[%s] Parsed %d in %d ms!",
          fileInfo.timeKey,
          this.parsedOrderDocumentsList.length,
          Date.now() - t
        );

        if (!this.parsedOrderDocumentsList.length)
        {
          return this.skip();
        }

        setImmediate(this.next());
      },
      function mapParsedOrdersStep()
      {
        var orderNoToDocumentsMap = {};

        for (var i = 0; i < this.parsedOrderDocumentsList.length; ++i)
        {
          var orderDocument = this.parsedOrderDocumentsList[i];

          if (orderNoToDocumentsMap[orderDocument.orderNo] === undefined)
          {
            orderNoToDocumentsMap[orderDocument.orderNo] = [];
          }

          orderNoToDocumentsMap[orderDocument.orderNo].push({
            nc15: orderDocument.nc15,
            name: orderDocument.name
          });
        }

        this.parsedOrderDocumentsList = null;
        this.orderNoToDocumentsMap = orderNoToDocumentsMap;
      },
      function findExistingOrdersStep()
      {
        Order.find({_id: {$in: Object.keys(this.orderNoToDocumentsMap)}}, {documents: 1}).lean().exec(this.next());
      },
      function compareOrderDocumentsStep(err, orders)
      {
        if (err)
        {
          return this.skip(err);
        }

        var updateList = [];
        var updatedAt = new Date();

        for (var i = 0; i < orders.length; ++i)
        {
          var order = orders[i];
          var oldDocuments = order.documents || [];
          var newDocuments = this.orderNoToDocumentsMap[order._id];

          if (deepEqual(oldDocuments, newDocuments))
          {
            continue;
          }

          updateList.push({
            condition: {_id: order._id},
            update: {
              $set: {
                updatedAt: updatedAt,
                documents: newDocuments
              },
              $push: {
                changes: {
                  time: updatedAt,
                  user: null,
                  oldValues: {documents: oldDocuments},
                  newValues: {documents: newDocuments},
                  comment: ''
                }
              }
            }
          });
        }

        this.updateList = updateList;

        setImmediate(this.next());
      },
      function updateOrdersStep()
      {
        for (var i = 0; i < this.updateList.length; ++i)
        {
          Order.collection.update(this.updateList[i].condition, this.updateList[i].update, this.group());
        }
      },
      function finalizeStep(err)
      {
        var updateCount = this.updateList ? this.updateList.length : 0;

        this.parsedOrderDocumentsList = null;
        this.orderNoToDocumentsMap = null;
        this.updateList = null;

        if (!err || err.code === 11000)
        {
          return done(null, {updateCount: updateCount});
        }

        // mongodb package bug workaround
        if (err.err && !err.message)
        {
          var code = err.code;

          err = new Error(err.err);
          err.name = 'MongoError';
          err.code = code;
        }

        return done(err, null);
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
