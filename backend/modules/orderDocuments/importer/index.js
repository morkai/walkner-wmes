// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var _ = require('lodash');
var deepEqual = require('deep-equal');
var moment = require('moment');
var step = require('h5.step');
var fs = require('fs-extra');
var parseOrderDocuments = require('./parseOrderDocuments');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_COOIS_DOCS\.txt$/,
  parsedOutputDir: null,
  xiconfProgramPatterns: [],
  xiconfProgramFilePathPattern: './{timestamp}@T_COOIS_XICONF.txt'
};

exports.start = function startOrderDocumentsImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var XICONF_PROGRAM_PATTERNS = module.config.xiconfProgramPatterns;
  var XICONF_PROGRAM_FILE_PATH_PATTERN = module.config.xiconfProgramFilePathPattern;

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

        app.broker.publish('orderDocuments.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug("[%s] Imported in %d ms: %s", fileInfo.timeKey, Date.now() - startTime, JSON.stringify(summary));

        app.broker.publish('orderDocuments.synced', {
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
        var orderNoToProgramMap = {};

        for (var i = 0; i < this.parsedOrderDocumentsList.length; ++i)
        {
          var orderDocument = this.parsedOrderDocumentsList[i];

          if (orderNoToDocumentsMap[orderDocument.orderNo] === undefined)
          {
            orderNoToDocumentsMap[orderDocument.orderNo] = [];
          }

          orderNoToDocumentsMap[orderDocument.orderNo].push({
            item: orderDocument.item,
            nc15: orderDocument.nc15,
            name: orderDocument.name
          });

          matchPrograms(orderDocument, orderNoToProgramMap);
        }

        this.parsedOrderDocumentsList = null;
        this.orderNoToDocumentsMap = orderNoToDocumentsMap;
        this.orderNoToProgramMap = orderNoToProgramMap;

        setImmediate(this.next());
      },
      function findExistingOrdersStep()
      {
        var conditions = {
          _id: {
            $in: Object.keys(this.orderNoToDocumentsMap)
          }
        };
        var fields = {
          qty: 1,
          documents: 1
        };

        Order.find(conditions, fields).lean().exec(this.next());
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
          var program = this.orderNoToProgramMap[order._id];

          if (program)
          {
            program.qty = order.qty;
          }

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

        setImmediate(buildXiconfProgramsDumpFile, fileInfo.timestamp, this.orderNoToProgramMap);
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
        this.orderNoToProgramMap = null;
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

    fs.move(oldFilePath, newFilePath, function(err)
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

  function matchPrograms(orderDocument, orderNoToProgramMap)
  {
    for (var i = 0; i < XICONF_PROGRAM_PATTERNS.length; ++i)
    {
      var matches = orderDocument.name.match(XICONF_PROGRAM_PATTERNS[i]);

      if (matches)
      {
        orderNoToProgramMap[orderDocument.orderNo] = {
          nc12: orderDocument.nc15.substring(3),
          name: matches.length > 1 ? matches[1] : orderDocument.name,
          qty: -1
        };

        break;
      }
    }
  }

  function buildXiconfProgramsDumpFile(timestamp, orderNoToProgramMap)
  {
    if (!module.config.xiconfProgramFilePathPattern)
    {
      return;
    }

    var orderNos = Object.keys(orderNoToProgramMap);

    if (!orderNos.length)
    {
      return;
    }

    step(
      function findXiconfOrdersStep()
      {
        XiconfOrder.find({_id: {$in: orderNos}}, {}).exec(this.next());
      },
      function prepareOrderItemsStep(err, xiconfOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        var xiconfOrderItems = [];

        for (var i = 0; i < xiconfOrders.length; ++i)
        {
          var xiconfOrder = xiconfOrders[i];

          addXiconfOrderItems(
            xiconfOrder,
            orderNoToProgramMap[xiconfOrder._id],
            xiconfOrderItems
          );
        }

        setImmediate(this.next(), null, xiconfOrderItems);
      },
      function writeFileStep(err, xiconfOrderItems)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!xiconfOrderItems.length)
        {
          return this.skip();
        }

        var filePath = XICONF_PROGRAM_FILE_PATH_PATTERN.replace('{timestamp}', Math.ceil(timestamp / 1000));
        var fileContents = [
          'DOCS',
          '-----------------------------------------------------------------------------------------------------------',
          '|Order    |Material       |Reqmts qty|Material Description                             |Reqmt Date|Deleted|',
          '-----------------------------------------------------------------------------------------------------------'
        ];

        for (var i = 0; i < xiconfOrderItems.length; ++i)
        {
          var item = xiconfOrderItems[i];
          var row = [
            '',
            item.orderNo,
            '000' + item.nc12,
            _.padStart(item.quantity.toString(), 9, ' ') + ' ',
            _.padEnd(item.name, 49, ' '),
            moment(item.reqDate).format('DD.MM.YYYY'),
            '       ',
            ''
          ];

          fileContents.push(row.join('|'));
        }

        fileContents.push(fileContents[0]);

        fs.writeFile(filePath, fileContents.join('\r\n'), this.next());
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error("Failed to build Xiconf dump file: %s", err.message);
        }
      }
    );
  }

  function addXiconfOrderItems(xiconfOrder, newProgram, xiconfOrderItems)
  {
    var programItem = null;

    for (var i = 0; i < xiconfOrder.items.length; ++i)
    {
      var item = xiconfOrder.items[i];

      if (item.kind !== 'led' && item.kind !== 'gprs' && item.kind !== 'program')
      {
        continue;
      }

      var xiconfOrderItem = {
        orderNo: xiconfOrder._id,
        nc12: item.nc12,
        name: item.name,
        quantity: item.quantityTodo,
        reqDate: xiconfOrder.reqDate
      };

      if (item.kind === 'program')
      {
        programItem = xiconfOrderItem;
      }

      xiconfOrderItems.push(xiconfOrderItem);
    }

    if (programItem)
    {
      programItem.nc12 = newProgram.nc12;
      programItem.name = newProgram.name;

      if (newProgram.qty !== -1)
      {
        programItem.quantity = newProgram.qty;
      }
    }
    else
    {
      programItem = {
        orderNo: xiconfOrder._id,
        nc12: newProgram.nc12,
        name: newProgram.name,
        quantity: newProgram.qty === -1 ? xiconfOrder.quantityTodo : newProgram.qty,
        reqDate: xiconfOrder.reqDate
      };

      xiconfOrderItems.push(programItem);
    }

    programItem.name = 'Program ' + programItem.name;
  }
};
