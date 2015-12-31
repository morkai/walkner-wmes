// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var step = require('h5.step');
var parseOrders = require('./parseOrders');

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

  var IMPORT_KINDS = {
    program: true,
    led: true,
    gprs: true
  };

  var Order = mongoose.model('Order');
  var XiconfOrder = mongoose.model('XiconfOrder');

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
          updateCount: summary.updateCount,
          insertCount: summary.insertCount
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

        this.parsedOrdersList = parseOrders(fileContents);

        module.debug("[%s] Parsed %d orders in %d ms!", fileInfo.timeKey, this.parsedOrdersList.length, Date.now() - t);

        setImmediate(this.next());
      },
      function mapParsedOrdersStep()
      {
        var parsedOrdersMap = {};

        for (var i = 0; i < this.parsedOrdersList.length; ++i)
        {
          var parsedOrder = this.parsedOrdersList[i];

          if (parsedOrdersMap[parsedOrder.no] === undefined)
          {
            parsedOrdersMap[parsedOrder.no] = [parsedOrder];
          }
          else
          {
            parsedOrdersMap[parsedOrder.no].push(parsedOrder);
          }
        }

        this.parsedOrdersList = null;
        this.parsedOrdersMap = parsedOrdersMap;
      },
      function findExistingOrdersStep()
      {
        var orderIds = Object.keys(this.parsedOrdersMap);

        Order.find({_id: {$in: orderIds}}, {operations: 0, changes: 0, statuses: 0}).lean().exec(this.parallel());
        XiconfOrder.find({_id: {$in: orderIds}}).lean().exec(this.parallel());
      },
      function mapExistingOrdersStep(err, ordersList, xiconfOrdersList)
      {
        if (err)
        {
          return this.skip(err);
        }

        var xiconfOrdersMap = {};

        for (var j = 0; j < xiconfOrdersList.length; ++j)
        {
          var xiconfOrder = xiconfOrdersList[j];

          xiconfOrdersMap[xiconfOrder._id] = xiconfOrder;
        }

        this.ordersList = ordersList;
        this.xiconfOrdersMap = xiconfOrdersMap;

        setImmediate(this.next());
      },
      function compareOrdersStep()
      {
        var insertsMap = {};
        var updatesList = [];
        var updateCount = 0;
        var deletedItemsMap = {};
        var importedAt = new Date(fileInfo.timestamp);

        for (var i = 0; i < this.ordersList.length; ++i)
        {
          var order = this.ordersList[i];

          if (order.name === null || order.nc12 === null || order.qty === null)
          {
            continue;
          }

          var xiconfOrder = this.xiconfOrdersMap[order._id];
          var parsedOrders = this.parsedOrdersMap[order._id];

          if (xiconfOrder === undefined)
          {
            xiconfOrder = insertsMap[order._id];

            if (xiconfOrder === undefined)
            {
              xiconfOrder = insertsMap[order._id] = createEmptyXiconfOrder(importedAt, order);
            }

            addParsedOrdersToXiconfOrder(parsedOrders, xiconfOrder);
          }
          else
          {
            updateCount += compareOrders(updatesList, deletedItemsMap, importedAt, order, xiconfOrder, parsedOrders);
          }
        }

        this.insertsList = _.values(insertsMap);
        this.updatesList = updatesList;
        this.insertCount = this.insertsList.length;
        this.updateCount = updateCount;
        this.deletedItemsMap = deletedItemsMap;

        setImmediate(this.next());
      },
      function createBatchesStep()
      {
        var batchSize = 250;
        var batchCount = Math.ceil(this.insertsList.length / batchSize);
        var i;

        this.batches = [];

        for (i = 0; i < batchCount; ++i)
        {
          this.batches.push(this.insertsList.slice(i * batchSize, i * batchSize + batchSize));
        }

        setImmediate(this.next());
      },
      function updateDbStep()
      {
        var i;

        for (i = 0; i < this.batches.length; ++i)
        {
          XiconfOrder.collection.insert(this.batches[i], {continueOnError: true}, this.group());
        }

        for (i = 0; i < this.updatesList.length; ++i)
        {
          XiconfOrder.collection.update(
            this.updatesList[i].condition,
            this.updatesList[i].update,
            this.group()
          );
        }
      },
      function findOrdersWithMultipleProgramsStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        var orderIds = Object.keys(this.deletedItemsMap);

        if (!orderIds.length)
        {
          return this.skip();
        }

        XiconfOrder.find({_id: {$in: orderIds}}, {items: 1, nc12: 1}).lean().exec(this.next());
      },
      function removeDeletedItemsStep(err, xiconfOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (var i = 0; i < xiconfOrders.length; ++i)
        {
          var order = xiconfOrders[i];
          var allItems = order.items;
          var deletedItems = this.deletedItemsMap[order._id];
          var update = {
            nc12: [order.nc12[0]],
            items: []
          };

          for (var ii = 0; ii < allItems.length; ++ii)
          {
            if (_.includes(deletedItems, ii))
            {
              continue;
            }

            var item = allItems[ii];

            update.nc12.push(item.nc12);
            update.items.push(item);
          }

          XiconfOrder.update({_id: order._id}, {$set: update}, this.group());
        }
      },
      function finalizeStep(err)
      {
        if (!err || err.code === 11000)
        {
          return done(null, {
            insertCount: this.insertCount,
            updateCount: this.updateCount
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

  function createEmptyXiconfOrder(importedAt, order)
  {
    return {
      _id: order._id,
      startDate: order.startDate,
      finishDate: order.finishDate,
      reqDate: null,
      name: order.name,
      nc12: [order.nc12],
      quantityTodo: order.qty,
      quantityDone: 0,
      status: -1,
      serviceTagCounter: 0,
      items: [],
      startedAt: null,
      finishedAt: null,
      importedAt: importedAt
    };
  }

  function addParsedOrdersToXiconfOrder(parsedOrders, xiconfOrder)
  {
    var maxReqDate = 0;

    _.forEach(parsedOrders, function(parsedOrder)
    {
      xiconfOrder.nc12.push(parsedOrder.nc12);
      xiconfOrder.items.push(createXiconfOrderItem(parsedOrder));

      if (parsedOrder.reqDate > maxReqDate)
      {
        maxReqDate = parsedOrder.reqDate;
      }
    });

    xiconfOrder.reqDate = maxReqDate;
  }

  function createXiconfOrderItem(parsedOrder)
  {
    return {
      kind: parsedOrder.kind,
      nc12: parsedOrder.nc12,
      name: parsedOrder.name,
      quantityTodo: parsedOrder.quantity,
      quantityDone: 0,
      extraQuantityDone: 0,
      serialNumbers: []
    };
  }

  function compareOrders(updatesList, deletedItemsMap, importedAt, order, xiconfOrder, parsedOrders)
  {
    if (importedAt <= xiconfOrder.importedAt)
    {
      return 0;
    }

    var $set = {};
    var $push = {};

    compareOrderToXiconfOrder($set, order, xiconfOrder);
    compareParsedOrdersToXiconfOrder($set, $push, deletedItemsMap, parsedOrders, xiconfOrder);

    var emptySet = _.isEmpty($set);
    var emptyPush = _.isEmpty($push);

    if (emptySet && emptyPush)
    {
      return 0;
    }

    if ($set.nc12)
    {
      collectXiconfOrdersNc12($set, order, xiconfOrder);
    }

    if (emptySet)
    {
      $set.importedAt = importedAt;
    }

    var condition = {_id: xiconfOrder._id};

    updatesList.push({
      condition: condition,
      update: {$set: $set}
    });

    if (!emptyPush)
    {
      updatesList.push({
        condition: condition,
        update: {$push: $push}
      });
    }

    return 1;
  }

  function compareOrderToXiconfOrder($set, order, xiconfOrder)
  {
    if (order.name !== xiconfOrder.name)
    {
      $set.name = order.name;
    }

    if (order.nc12 !== xiconfOrder.nc12[0])
    {
      $set.nc12 = true;
    }

    if (!_.isEqual(order.startDate, xiconfOrder.startDate))
    {
      $set.startDate = order.startDate;
    }

    if (!_.isEqual(order.finishDate, xiconfOrder.finishDate))
    {
      $set.finishDate = order.finishDate;
    }

    if (order.qty !== xiconfOrder.quantityTodo)
    {
      $set.quantityTodo = order.qty;
    }
  }

  function compareParsedOrdersToXiconfOrder($set, $push, deletedItemsMap, parsedOrdersList, xiconfOrder)
  {
    var parsedOrdersMap = {};
    var deletedItems = [];

    _.forEach(parsedOrdersList, function(parsedOrder)
    {
      parsedOrdersMap[parsedOrder.nc12] = parsedOrder;
    });

    _.forEach(xiconfOrder.items, function(xiconfOrderItem, i)
    {
      var itemExists = compareParsedOrderToXiconfOrderItem($set, parsedOrdersMap, xiconfOrderItem, i);

      if (!itemExists && IMPORT_KINDS[xiconfOrderItem.kind])
      {
        deletedItems.push(i);
      }
    });

    if (deletedItems.length)
    {
      deletedItemsMap[xiconfOrder._id] = deletedItems;
    }

    _.forEach(parsedOrdersMap, function(parsedOrder)
    {
      if (!$push.items)
      {
        $push.items = {$each: []};
        $push.nc12 = {$each: []};
      }

      $push.items.$each.push(createXiconfOrderItem(parsedOrder));
      $push.nc12.$each.push(parsedOrder.nc12);
    });
  }

  function compareParsedOrderToXiconfOrderItem($set, parsedOrdersMap, xiconfOrderItem, i)
  {
    var parsedOrder = parsedOrdersMap[xiconfOrderItem.nc12];

    if (!parsedOrder)
    {
      return false;
    }

    delete parsedOrdersMap[xiconfOrderItem.nc12];

    if (parsedOrder.name !== xiconfOrderItem.name)
    {
      $set['items.' + i + '.name'] = parsedOrder.name;
    }

    if (parsedOrder.quantity !== xiconfOrderItem.quantityTodo)
    {
      $set['items.' + i + '.quantityTodo'] = parsedOrder.quantity;
    }

    return true;
  }

  function collectXiconfOrdersNc12($set, order, xiconfOrder)
  {
    $set.nc12 = [order.nc12];

    _.forEach(xiconfOrder.items, function(item)
    {
      $set.nc12.push(item.nc12);
    });
  }
};
