// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var deepEqual = require('deep-equal');
var step = require('h5.step');
var createParser = require('./createParser');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_WMES_(ORDERS|OPERS)_([0-9]+)\.txt$/,
  parsedOutputDir: null
};

exports.start = function startOrdersImporterModule(app, module)
{
  var IGNORED_PROPERTIES = {
    createdAt: true,
    updatedAt: true,
    tzOffsetMs: true,
    statusesSetAt: true,
    delayReason: true,
    documents: true,
    changes: true,
    importTs: true
  };

  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("orders/importer/orders module requires the mongoose module!");
  }

  var Order = mongoose.model('Order');
  var queue = [];
  var lock = false;

  createParser(app, module, enqueueAndCompare);

  function enqueueAndCompare(err, orders, missingOrders)
  {
    if (err)
    {
      return;
    }

    queue.push(orders, missingOrders);

    compareNext();
  }

  function compareNext()
  {
    if (lock)
    {
      return;
    }

    lock = true;

    var orders = queue.shift();
    var missingOrders = queue.shift();
    var orderIds = Object.keys(orders);
    var missingOrderIds = Object.keys(missingOrders);
    var allOrderIds = orderIds.concat(missingOrderIds);

    module.debug("Comparing %d orders and %d missing orders...", orderIds.length, missingOrderIds.length);

    Order.find({_id: {$in: allOrderIds}}).lean().exec(function(err, orderModels)
    {
      if (err)
      {
        module.error("Failed to fetch orders for comparison: %s", err.message);

        return unlock();
      }

      var ts = new Date();
      var insertList = [];
      var updateList = [];

      _.forEach(orderModels, compareOrder.bind(null, ts, updateList, orders, missingOrders));

      createOrdersForInsertion(ts, insertList, orders, missingOrders);

      saveOrders(insertList, updateList);
    });
  }

  function unlock()
  {
    lock = false;

    if (queue.length !== 0)
    {
      setImmediate(compareNext);
    }
  }

  function compareOrder(ts, updateList, orders, missingOrders, orderModel)
  {
    var orderNo = orderModel._id;

    if (typeof orders[orderNo] === 'object')
    {
      compareOrderWithDoc(ts, updateList, orderModel, orders[orderNo]);

      delete orders[orderNo];
    }
    else if (typeof missingOrders[orderNo] === 'object')
    {
      compareMissingOrderWithDoc(ts, updateList, orderModel, missingOrders[orderNo]);

      delete missingOrders[orderNo];
    }
  }

  function compareOrderWithDoc(ts, updateList, orderModel, newOrderData)
  {
    if (orderModel.importTs > newOrderData.importTs)
    {
      return;
    }

    var different = false;
    var changes = {
      time: newOrderData.importTs,
      user: null,
      oldValues: {},
      newValues: {},
      comment: ''
    };
    var $set = {
      updatedAt: ts,
      importTs: newOrderData.importTs
    };

    _.forEach(newOrderData, function(newValue, key)
    {
      if (IGNORED_PROPERTIES[key])
      {
        return;
      }

      var oldValue = orderModel[key];

      if (oldValue != null && typeof oldValue.toObject === 'function')
      {
        oldValue = oldValue.toObject();
      }

      if (!deepEqual(oldValue, newValue, {strict: true}))
      {
        if (key === 'operations' && _.isEmpty(newValue))
        {
          return;
        }

        different = true;
        $set[key] = newValue;
        changes.oldValues[key] = oldValue;
        changes.newValues[key] = newValue;
      }
    });

    if (different)
    {
      updateList.push({
        conditions: {_id: orderModel._id},
        update: {
          $set: Order.prepareForUpdate(orderModel, newOrderData, ts, changes, $set),
          $push: {changes: changes}
        }
      });
    }
  }

  function compareMissingOrderWithDoc(ts, updateList, orderModel, missingOrder)
  {
    if (orderModel.importTs > missingOrder.importTs)
    {
      return;
    }

    var oldOperations = orderModel.operations;

    if (!Array.isArray(oldOperations))
    {
      oldOperations = [];
    }

    if (!deepEqual(oldOperations, missingOrder.operations, {strict: true}))
    {
      updateList.push({
        conditions: {_id: orderModel._id},
        update: {
          $set: {
            updatedAt: ts,
            operations: missingOrder.operations,
            importTs: missingOrder.importTs
          },
          $push: {
            changes: {
              time: ts,
              user: null,
              oldValues: {operations: oldOperations},
              newValues: {operations: missingOrder.operations},
              comment: ''
            }
          }
        }
      });
    }
  }

  function createOrdersForInsertion(ts, insertList, orders, missingOrders)
  {
    _.forEach(orders, function(order)
    {
      insertList.push(Order.prepareForInsert(order, ts));
    });

    _.forEach(missingOrders, function(missingOrder)
    {
      insertList.push(Order.prepareMissingForInsert(missingOrder, ts));
    });
  }

  function saveOrders(insertList, updateList)
  {
    var createdOrdersCount = insertList.length;
    var updatedOrdersCount = updateList.length;
    var insertBatchCount = Math.ceil(createdOrdersCount / 100);
    var steps = [];

    for (var i = 0; i < insertBatchCount; ++i)
    {
      steps.push(_.partial(createOrdersStep, insertList.splice(0, 100)));
    }

    _.forEach(updateList, function(orderModel)
    {
      steps.push(_.partial(updateOrderStep, orderModel));
    });

    steps.push(function unlockStep(err)
    {
      if (err)
      {
        module.error("Failed to sync data: %s", err.message);

        return unlock();
      }

      module.info("Synced %d new and %d existing orders", createdOrdersCount, updatedOrdersCount);

      app.broker.publish('orders.synced', {
        created: createdOrdersCount,
        updated: updatedOrdersCount,
        moduleName: module.name
      });

      unlock();
    });

    step(steps);
  }

  function createOrdersStep(orders, err)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.skip(err);
    }

    Order.collection.insert(orders, this.next());
  }

  function updateOrderStep(update, err)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.skip(err);
    }

    Order.collection.update(update.conditions, update.update, this.next());
  }
};
