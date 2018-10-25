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
  filterRe: /^T_COOIS_BOM\.txt$/,
  parsedOutputDir: null
};

exports.start = function startOrderBomImporterModule(app, module)
{
  const mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error('orders/importer/bom module requires the mongoose module!');
  }

  const Order = mongoose.model('Order');

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

        app.broker.publish('orders.bom.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug('[%s] Imported %d in %d ms', fileInfo.timeKey, count, Date.now() - startTime);

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

        module.debug('[%s] Parsing ~%d bytes...', fileInfo.timeKey, fileContents.length);

        const bom = {};
        const t = Date.now();

        this.count = parseOrderBomTable(fileContents, bom);

        module.debug('[%s] Parsed %d items in %d ms!', fileInfo.timeKey, this.count, Date.now() - t);

        setImmediate(this.next(), bom);
      },
      function updateOrdersStep(bom)
      {
        module.debug('[%s] Updating orders...', fileInfo.timeKey);

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
    const orderNo = orderNos.shift();
    const newBom = bom[orderNo];
    let oldBom = null;

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
        const changes = {
          time: t,
          user: null,
          oldValues: {bom: oldBom},
          newValues: {bom: newBom},
          comment: ''
        };
        const $set = {
          bom: newBom,
          updatedAt: t
        };

        Order.updateOne({_id: orderNo}, {$set: $set, $push: {changes: changes}}, done);
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error('[%s] Failed update BOM of order [%s]: %s', fileInfo.timeKey, orderNo, err.message);
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

  function parseOrderBomTable(input, bom)
  {
    let count = 0;

    parseSapTextTable(input, {
      columnMatchers: {
        orderNo: /^Order$/,
        nc12: /^Material$/,
        item: /^BOM item$/,
        qty: /^Req.*?qty$/,
        unit: /^Unit$/,
        description: /^Material Desc/,
        unloadingPoint: /^Unl.*?Point/,
        supplyArea: /^Sup.*?Area/
      },
      valueParsers: {
        nc12: function(input) { return input.replace(/^0+/, ''); },
        qty: parseSapNumber,
        description: parseSapString,
        unloadingPoint: parseSapString,
        supplyArea: parseSapString
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
          unloadingPoint: obj.unloadingPoint,
          supplyArea: obj.supplyArea
        });
      }
    });

    return count;
  }
};
