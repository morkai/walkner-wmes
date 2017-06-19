// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var moment = require('moment');
var step = require('h5.step');
var deepEqual = require('deep-equal');
var fs = require('fs-extra');
var parseSapTextTable = require('../../sap/util/parseSapTextTable');
var parseSapNumber = require('../../sap/util/parseSapNumber');
var parseSapString = require('../../sap/util/parseSapString');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_COOIS_BOM\.txt$/,
  parsedOutputDir: null
};

exports.start = function startOrderBomImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("orders/importer/bom module requires the mongoose module!");
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

        app.broker.publish('orders.bom.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug("[%s] Imported %d in %d ms", fileInfo.timeKey, count, Date.now() - startTime);

        app.broker.publish('orders.bom.synced', {
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

        var bom = {};
        var t = Date.now();

        this.count = parseOrderBomTable(fileContents, bom);

        module.debug("[%s] Parsed %d items in %d ms!", fileInfo.timeKey, this.count, Date.now() - t);

        setImmediate(this.next(), bom);
      },
      function updateOrdersStep(bom)
      {
        module.debug("[%s] Updating orders...", fileInfo.timeKey);

        updateNextOrder(fileInfo, new Date(), Object.keys(bom), bom, this.next());
      },
      function finalizeStep(err)
      {
        return done(err, this.count);
      }
    );
  }

  function updateNextOrder(fileInfo, t, orderNos, bom, done)
  {
    var orderNo = orderNos.shift();
    var newBom = bom[orderNo];
    var oldBom = null;

    delete bom[orderNo];

    step(
      function findOldBomStep()
      {
        Order.findById(orderNo, {bom: 1}).lean().exec(this.next());
      },
      function compareBomStep(err, order)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!order)
        {
          return this.skip();
        }

        oldBom = order.bom || [];

        if (deepEqual(newBom, oldBom))
        {
          return this.skip();
        }

        setImmediate(this.next());
      },
      function updateOrderStep()
      {
        var changes = {
          time: t,
          user: null,
          oldValues: {bom: oldBom},
          newValues: {bom: newBom},
          comment: ''
        };
        var $set = {
          bom: newBom,
          updatedAt: t
        };

        Order.update({_id: orderNo}, {$set: $set, $push: {changes: changes}}, done);
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error("[%s] Failed update BOM of order [%s]: %s", fileInfo.timeKey, orderNo, err.message);
        }

        if (orderNos.length)
        {
          setImmediate(updateNextOrder, fileInfo, t, orderNos, bom, done);
        }
        else
        {
          setImmediate(done);
        }
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

    fs.move(oldFilePath, newFilePath, {overwrite: true}, function(err)
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

  function parseOrderBomTable(input, bom)
  {
    var count = 0;

    parseSapTextTable(input, {
      columnMatchers: {
        orderNo: /^Order$/,
        nc12: /^Material$/,
        item: /^BOM item$/,
        qty: /^Req.*?qty$/,
        unit: /^Unit$/,
        description: /^Material Desc/,
        unloadingPoint: /^Unl.*?Point/
      },
      valueParsers: {
        nc12: function(input) { return input.replace(/^0+/, ''); },
        qty: parseSapNumber,
        description: parseSapString,
        unloadingPoint: parseSapString
      },
      itemDecorator: function(obj)
      {
        ++count;

        if (!bom[obj.orderNo])
        {
          bom[obj.orderNo] = [];
        }

        bom[obj.orderNo].push({
          nc12: obj.nc12,
          item: obj.item,
          qty: obj.qty,
          unit: obj.unit,
          name: obj.description,
          unloadingPoint: obj.unloadingPoint
        });
      }
    });

    return count;
  }
};
