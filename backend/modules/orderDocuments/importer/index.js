// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const _ = require('lodash');
const deepEqual = require('deep-equal');
const moment = require('moment');
const step = require('h5.step');
const fs = require('fs-extra');
const parseOrderDocuments = require('./parseOrderDocuments');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_COOIS_DOCS\.txt$/,
  parsedOutputDir: null,
  xiconfProgramPatterns: [],
  xiconfProgramFilePathPattern: './{timestamp}@T_COOIS_XICONF.txt'
};

exports.start = function startOrderDocumentsImporterModule(app, module)
{
  const mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error('mongoose module is required!');
  }

  const XICONF_PROGRAM_PATTERNS = module.config.xiconfProgramPatterns;
  const XICONF_PROGRAM_FILE_PATH_PATTERN = module.config.xiconfProgramFilePathPattern;

  const Order = mongoose.model('Order');
  const XiconfOrder = mongoose.model('XiconfOrder');

  const scheduleUpdateDocumentNames = _.debounce(updateDocumentNames, 30000);

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

    importFile(fileInfo, function(err, summary)
    {
      cleanUpFileInfoFile(fileInfo);

      if (err)
      {
        module.error('[%s] Failed to import: %s', fileInfo.timeKey, err.message);

        app.broker.publish('orderDocuments.syncFailed', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug('[%s] Imported in %d ms: %s', fileInfo.timeKey, Date.now() - startTime, JSON.stringify(summary));

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

        module.debug('[%s] Parsing ~%d bytes...', fileInfo.timeKey, fileContents.length);

        const t = Date.now();

        this.parsedOrderDocumentsList = parseOrderDocuments(fileContents);

        module.debug(
          '[%s] Parsed %d in %d ms!',
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
        const orderNoToDocumentsMap = {};
        const orderNoToProgramMap = {};

        for (let i = 0; i < this.parsedOrderDocumentsList.length; ++i)
        {
          const orderDocument = this.parsedOrderDocumentsList[i];

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
        const conditions = {
          _id: {
            $in: Object.keys(this.orderNoToDocumentsMap)
          }
        };
        const fields = {
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

        const updateList = [];
        const updatedAt = new Date();

        for (let i = 0; i < orders.length; ++i)
        {
          const order = orders[i];
          const oldDocuments = order.documents || [];
          const newDocuments = this.orderNoToDocumentsMap[order._id].sort(sortDocuments);
          const program = this.orderNoToProgramMap[order._id];

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
        for (let i = 0; i < this.updateList.length; ++i)
        {
          Order.collection.updateOne(this.updateList[i].condition, this.updateList[i].update, this.group());
        }
      },
      function finalizeStep(err)
      {
        const updateCount = this.updateList ? this.updateList.length : 0;

        this.parsedOrderDocumentsList = null;
        this.orderNoToDocumentsMap = null;
        this.orderNoToProgramMap = null;
        this.updateList = null;

        scheduleUpdateDocumentNames();

        if (!err || err.code === 11000)
        {
          return done(null, {updateCount: updateCount});
        }

        // mongodb package bug workaround
        if (err.err && !err.message)
        {
          const code = err.code;

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

  function sortDocuments(a, b)
  {
    if (a.item !== b.item)
    {
      return a.item - b.item;
    }

    if (a.name !== b.name)
    {
      return a.name.localeCompare(b.name);
    }

    return a.nc12 - b.nc12;
  }

  function matchPrograms(orderDocument, orderNoToProgramMap)
  {
    for (let i = 0; i < XICONF_PROGRAM_PATTERNS.length; ++i)
    {
      const matches = orderDocument.name.match(XICONF_PROGRAM_PATTERNS[i]);

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

    const orderNos = Object.keys(orderNoToProgramMap);

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

        const xiconfOrderItems = [];

        for (let i = 0; i < xiconfOrders.length; ++i)
        {
          const xiconfOrder = xiconfOrders[i];

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

        const filePath = XICONF_PROGRAM_FILE_PATH_PATTERN.replace('{timestamp}', Math.ceil(timestamp / 1000));
        const fileContents = [
          'DOCS',
          '-----------------------------------------------------------------------------------------------------------',
          '|Order    |Material       |Reqmts qty|Material Description                             |Reqmt Date|Deleted|',
          '-----------------------------------------------------------------------------------------------------------'
        ];

        for (let i = 0; i < xiconfOrderItems.length; ++i)
        {
          const item = xiconfOrderItems[i];
          const row = [
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
          module.error('Failed to build Xiconf dump file: %s', err.message);
        }
      }
    );
  }

  function addXiconfOrderItems(xiconfOrder, newProgram, xiconfOrderItems)
  {
    let programItem = null;

    for (let i = 0; i < xiconfOrder.items.length; ++i)
    {
      const item = xiconfOrder.items[i];

      if (item.kind !== 'led' && item.kind !== 'gprs' && item.kind !== 'program')
      {
        continue;
      }

      const xiconfOrderItem = {
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

  function updateDocumentNames()
  {
    const pipeline = [
      {$unwind: '$documents'},
      {$group: {_id: '$documents.nc15', name: {$max: '$documents.name'}}},
      {$out: 'orderdocumentnames'}
    ];

    Order.aggregate(pipeline, function(err)
    {
      if (err)
      {
        module.error(`Failed to update document names: ${err.message}`);
      }
    });
  }
};
