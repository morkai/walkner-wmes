// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var step = require('h5.step');
var parseXiconfOrders = require('./parseXiconfOrders');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_COOIS_XICONF\.txt$/,
  parsedOutputDir: null
};

exports.start = function startXiconfOrdersImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var Order = mongoose.model('Order');
  var XiconfProgramOrder = mongoose.model('XiconfProgramOrder');
  var XiconfLedOrder = mongoose.model('XiconfLedOrder');

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

        app.broker.publish('xiconf.orders.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug("[%s] Imported in %d ms: %s", fileInfo.timeKey, Date.now() - startTime, JSON.stringify(summary));

        app.broker.publish('xiconf.orders.synced', {
          timestamp: fileInfo.timestamp,
          programUpdateCount: summary.programUpdateCount,
          programInsertCount: summary.programInsertCount,
          ledUpdateCount: summary.ledUpdateCount,
          ledInsertCount: summary.ledInsertCount
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

        this.orderNoMap = {};
        this.allOrders = parseXiconfOrders(fileContents, this.orderNoMap);

        module.debug("[%s] Parsed %d orders in %d ms!", fileInfo.timeKey, this.allOrders.length, Date.now() - t);

        setImmediate(this.next());
      },
      function findOrderQuantityStep()
      {
        Order.find({_id: {$in: Object.keys(this.orderNoMap)}}, {qty: 1}).lean().exec(this.next());
      },
      function prepareOrderQuantityMapStep(err, orders)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (var i = 0; i < orders.length; ++i)
        {
          this.orderNoMap[orders[i]._id] = orders[i].qty;
        }

        setImmediate(this.next());
      },
      function prepareOrdersByKindStep()
      {
        var programOrdersMap = {};
        var ledOrdersMap = {};
        var importedAt = new Date(fileInfo.timestamp);

        for (var i = 0; i < this.allOrders.length; ++i)
        {
          var orderData = this.allOrders[i];
          var quantityParent = this.orderNoMap[orderData.no] || 0;

          if (orderData.kind === 'PROGRAM')
          {
            var nc12 = [{
              _id: orderData.nc12,
              name: orderData.name,
              quantityTodo: orderData.quantity,
              quantityDone: 0
            }];
            var quantityTodo = orderData.quantity;

            for (var ii = 0; ii < orderData.more.length; ++ii)
            {
              var orderData2 = orderData.more[ii];

              nc12.push({
                _id: orderData2.nc12,
                name: orderData2.name,
                quantityTodo: orderData2.quantity,
                quantityDone: 0
              });

              quantityTodo += orderData2.quantity;
            }

            programOrdersMap[orderData.no] = {
              _id: orderData.no,
              reqDate: orderData.reqDate,
              nc12: nc12,
              quantityParent: quantityParent,
              quantityTodo: quantityTodo,
              quantityDone: 0,
              serviceTagCounter: 0,
              status: -1,
              importedAt: importedAt,
              createdAt: null,
              finishedAt: null
            };
          }
          else
          {
            ledOrdersMap[orderData.no] = {
              _id: orderData.no,
              reqDate: orderData.reqDate,
              name: orderData.name,
              nc12: orderData.nc12,
              quantityParent: quantityParent,
              quantityTodo: orderData.quantity,
              quantityDone: 0,
              serialNos: [],
              importedAt: importedAt,
              createdAt: null,
              finishedAt: null
            };
          }
        }

        this.programOrdersMap = programOrdersMap;
        this.ledOrdersMap = ledOrdersMap;

        setImmediate(this.next());
      },
      function findExistingOrdersStep()
      {
        var programOrderIds = Object.keys(this.programOrdersMap);
        var ledOrderIds = Object.keys(this.ledOrdersMap);
        var missingProgramOrderIds = _.difference(ledOrderIds, programOrderIds);

        for (var i = 0; i < missingProgramOrderIds.length; ++i)
        {
          var missingProgramOrderId = missingProgramOrderIds[i];
          var ledOrder = this.ledOrdersMap[missingProgramOrderId];

          this.programOrdersMap[missingProgramOrderId] = {
            _id: missingProgramOrderId,
            reqDate: ledOrder.reqDate,
            nc12: [],
            quantityParent: ledOrder.quantityParent,
            quantityTodo: ledOrder.quantityParent,
            quantityDone: 0,
            serviceTagCounter: 0,
            status: -1,
            importedAt: ledOrder.importedAt,
            createdAt: null,
            finishedAt: null
          };

          programOrderIds.push(missingProgramOrderId);
        }

        if (programOrderIds.length)
        {
          XiconfProgramOrder
            .find({_id: {$in: programOrderIds}}, {name: 1, nc12: 1, quantityTodo: 1})
            .lean()
            .exec(this.parallel());
        }

        if (ledOrderIds.length)
        {
          XiconfLedOrder
            .find({_id: {$in: ledOrderIds}}, {name: 1, nc12: 1, quantityTodo: 1})
            .lean()
            .exec(this.parallel());
        }
      },
      function compareOrdersStep(err, programOrders, ledOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!Array.isArray(programOrders))
        {
          programOrders = [];
        }

        if (!Array.isArray(ledOrders))
        {
          ledOrders = [];
        }

        this.programOrderUpdates = [];
        this.ledOrderUpdates = [];

        var i;

        for (i = 0; i < programOrders.length; ++i)
        {
          compareOrders(this.programOrderUpdates, this.programOrdersMap, programOrders[i]);
        }

        for (i = 0; i < ledOrders.length; ++i)
        {
          compareOrders(this.ledOrderUpdates, this.ledOrdersMap, ledOrders[i]);
        }

        this.programOrderInserts = _.values(this.programOrdersMap);
        this.ledOrderInserts = _.values(this.ledOrdersMap);
        this.programOrdersMap = null;
        this.ledOrdersMap = null;

        setImmediate(this.next());
      },
      function createBatchesStep()
      {
        var batchSize = 1000;
        var programBatchCount = Math.ceil(this.programOrderInserts.length / batchSize);
        var ledBatchCount = Math.ceil(this.ledOrderInserts.length / batchSize);
        var i;

        this.programBatches = [];
        this.ledBatches = [];

        for (i = 0; i < programBatchCount; ++i)
        {
          this.programBatches.push(this.programOrderInserts.slice(i * batchSize, i * batchSize + batchSize));
        }

        for (i = 0; i < ledBatchCount; ++i)
        {
          this.ledBatches.push(this.ledOrderInserts.slice(i * batchSize, i * batchSize + batchSize));
        }

        setImmediate(this.next());
      },
      function updateDbStep()
      {
        var i;

        for (i = 0; i < this.programBatches.length; ++i)
        {
          XiconfProgramOrder.collection.insert(this.programBatches[i], {continueOnError: true}, this.group());
        }

        for (i = 0; i < this.programOrderUpdates.length; ++i)
        {
          XiconfProgramOrder.collection.update(
            this.programOrderUpdates[i].condition,
            this.programOrderUpdates[i].update,
            this.group()
          );
        }

        for (i = 0; i < this.ledBatches.length; ++i)
        {
          XiconfLedOrder.collection.insert(this.ledBatches[i], {continueOnError: true}, this.group());
        }

        for (i = 0; i < this.ledOrderUpdates.length; ++i)
        {
          XiconfLedOrder.collection.update(
            this.ledOrderUpdates[i].condition,
            this.ledOrderUpdates[i].update,
            this.group()
          );
        }
      },
      function finalizeStep(err)
      {
        if (!err || err.code === 11000)
        {
          return done(null, {
            programUpdateCount: this.programOrderUpdates.length,
            programInsertCount: this.programOrderInserts.length,
            ledUpdateCount: this.ledOrderUpdates.length,
            ledInsertCount: this.ledOrderInserts.length
          });
        }

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

  function compareOrders(updates, newOrdersMap, oldOrder)
  {
    var newOrder = newOrdersMap[oldOrder._id];

    if (!newOrder)
    {
      return;
    }

    delete newOrdersMap[oldOrder._id];

    if (newOrder.importedAt < oldOrder.importedAt)
    {
      return;
    }

    if (newOrder.quantityParent === oldOrder.quantityParent
      && newOrder.name === oldOrder.name
      && newOrder.nc12 === oldOrder.nc12
      && newOrder.quantityTodo === oldOrder.quantityTodo
      && newOrder.reqDate.getTime() === oldOrder.reqDate.getTime())
    {
      return;
    }

    updates.push({
      condition: {_id: newOrder._id},
      update: {$set: {
        name: newOrder.name,
        nc12: newOrder.nc12,
        quantityParent: newOrder.quantityParent,
        quantityTodo: newOrder.quantityTodo,
        importedAt: newOrder.importedAt
      }}
    });
  }
};
