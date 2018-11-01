// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');
const fs = require('fs-extra');
const parseSapTextTable = require('../../sap/util/parseSapTextTable');
const parseSapNumber = require('../../sap/util/parseSapNumber');
const parseSapString = require('../../sap/util/parseSapString');
const parseSapDate = require('../../sap/util/parseSapDate');
const parseSapTime = require('../../sap/util/parseSapTime');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_ZOIN(?:_(.*?))?\.txt$/,
  parsedOutputDir: null
};

exports.start = function startOrderIntakeImporterModule(app, module)
{
  const mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error('orders/importer/intake module requires the mongoose module!');
  }

  const Order = mongoose.model('Order');
  const OrderIntake = mongoose.model('OrderIntake');

  const filePathCache = {};
  let locked = false;
  const queue = [];

  app.broker.subscribe('directoryWatcher.changed', queueFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    if (filePathCache[fileInfo.filePath])
    {
      return false;
    }

    const matches = fileInfo.fileName.match(module.config.filterRe);

    if (matches === null)
    {
      return false;
    }

    fileInfo.plant = matches[1] || '?';
    fileInfo.timeKey = fileInfo.plant + ':' + createTimeKey(fileInfo.timestamp);

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

        app.broker.publish('orders.intake.syncFailed', {
          timestamp: fileInfo.timestamp,
          plant: fileInfo.plant,
          error: err.message
        });
      }
      else
      {
        module.debug('[%s] Imported %d in %d ms', fileInfo.timeKey, count, Date.now() - startTime);

        app.broker.publish('orders.intake.synced', {
          timestamp: fileInfo.timestamp,
          plant: fileInfo.plant,
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

        this.orderIntakes = parseOrderIntakeTable(fileContents);

        module.debug('[%s] Parsed %d items in %d ms!', fileInfo.timeKey, this.orderIntakes.length, Date.now() - t);

        setImmediate(this.next());
      },
      function upsertOrderIntakesStep()
      {
        module.debug('[%s] Upserting order intakes...', fileInfo.timeKey);

        const t = Date.now();

        upsertNextOrderIntakesBatch(this.orderIntakes, 0, 10, this.next());

        function upsertNextOrderIntakesBatch(orderIntakes, batchNo, batchSize, done)
        {
          const startIndex = batchNo * batchSize;
          const endIndex = Math.min(startIndex + batchSize, orderIntakes.length);

          step(
            function()
            {
              for (let i = startIndex; i < endIndex; ++i)
              {
                const orderIntake = orderIntakes[i];

                OrderIntake.replaceOne(
                  {_id: orderIntake._id},
                  orderIntake,
                  {upsert: true},
                  this.group()
                );
              }
            },
            function(err)
            {
              if (err)
              {
                module.error('Failed to upsert order intakes: %s', err.stack);
              }

              if (endIndex === orderIntakes.length)
              {
                module.debug(
                  '[%s] Upserted %d order intakes in %d ms!', fileInfo.timeKey, orderIntakes.length, Date.now() - t
                );

                return done();
              }

              return setImmediate(upsertNextOrderIntakesBatch, orderIntakes, batchNo + 1, batchSize, done);
            }
          );
        }
      },
      function updateOrdersStep()
      {
        module.debug('[%s] Updating orders...', fileInfo.timeKey);

        upsertNextOrdersBatch(fileInfo, new Date(), this.orderIntakes, 0, 10, this.next());
      },
      function finalizeStep(err)
      {
        return done(err, this.orderIntakes.length);
      }
    );
  }

  function upsertNextOrdersBatch(fileInfo, t, orderIntakes, batchNo, batchSize, done)
  {
    const startIndex = batchNo * batchSize;
    const endIndex = Math.min(startIndex + batchSize, orderIntakes.length);

    step(
      function()
      {
        for (let i = startIndex; i < endIndex; ++i)
        {
          updateOrders(t, orderIntakes[i], this.group());
        }
      },
      function(err)
      {
        if (err)
        {
          module.error('[%s] Failed to update orders: %s', fileInfo.timeKey, err.message);
        }

        if (endIndex === orderIntakes.length)
        {
          module.debug('[%s] Updated orders in %d ms!', fileInfo.timeKey, Date.now() - t.getTime());

          return done();
        }

        return setImmediate(upsertNextOrdersBatch, fileInfo, t, orderIntakes, batchNo + 1, batchSize, done);
      }
    );
  }

  function updateOrders(t, orderIntake, done)
  {
    step(
      function findOrdersStep()
      {
        const conditions = {
          salesOrder: orderIntake._id.no,
          salesOrderItem: orderIntake._id.item
        };
        const fields = {
          description: 1,
          soldToParty: 1,
          sapCreatedAt: 1
        };

        Order.find(conditions, fields).lean().exec(this.next());
      },
      function updateOrdersStep(err, orders)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (let i = 0; i < orders.length; ++i)
        {
          updateOrder(t, orders[i], orderIntake, this.group());
        }
      },
      done
    );
  }

  function updateOrder(t, order, orderIntake, done)
  {
    let changed = false;
    const changes = {
      time: t,
      user: null,
      oldValues: {},
      newValues: {},
      comment: ''
    };
    const $set = {
      updatedAt: t
    };

    ['description', 'soldToParty', 'sapCreatedAt'].forEach(p =>
    {
      const oldValue = order[p] || null;
      const newValue = orderIntake[p] || null;

      if (_.isEqual(oldValue, newValue))
      {
        return;
      }

      changed = true;
      changes.oldValues[p] = oldValue;
      changes.newValues[p] = newValue;
      $set[p] = newValue;
    });

    if (!changed)
    {
      return setImmediate(done);
    }

    Order.updateOne({_id: order._id}, {$set: $set, $push: {changes: changes}}, done);
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

  function parseOrderIntakeTable(input)
  {
    return parseSapTextTable(input, {
      columnMatchers: {
        nc12: /^Material$/,
        description: /^Desc/,
        qty: /^Order qty/,
        salesOrder: /^Sales Doc/,
        salesOrderItem: /Item/,
        soldToParty: /^Sold-to/,
        shipTo: /^Ship to/,
        docDate: /^Doc.*?Date/,
        docTime: /^Doc.*?Time/
      },
      valueParsers: {
        nc12: function(input) { return input.replace(/^0+/, ''); },
        description: parseSapString,
        qty: parseSapNumber,
        docDate: parseSapDate,
        docTime: parseSapTime
      },
      itemDecorator: function(obj)
      {
        if (!obj.description.length || !obj.docDate || !obj.docTime)
        {
          return null;
        }

        return {
          _id: {
            no: obj.salesOrder,
            item: obj.salesOrderItem
          },
          nc12: obj.nc12,
          description: obj.description,
          qty: obj.qty,
          soldToParty: obj.soldToParty,
          shipTo: obj.shipTo,
          sapCreatedAt: new Date(
            obj.docDate.y, obj.docDate.m - 1, obj.docDate.d,
            obj.docTime.h, obj.docTime.m, obj.docTime.s
          )
        };
      }
    });
  }
};
