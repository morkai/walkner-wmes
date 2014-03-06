'use strict';

var lodash = require('lodash');
var deepEqual = require('deep-equal');
var step = require('h5.step');
var createParser = require('./createParser');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  stepCount: 1,
  filterRe: /^Job PL02_(ORDER|OPER)_INFO, Step ([0-9]+)\.html?$/,
  parsedOutputDir: null
};

exports.start = function startOrdersImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("orders/importer/orders module requires the mongoose module!");
  }

  var Order = mongoose.model('Order');
  var queue = [];
  var lock = false;

  createParser(app, module, module.config.filterRe, module.config.stepCount, enqueueAndCompare);

  function enqueueAndCompare(orders, missingOrders)
  {
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

    module.debug(
      "Comparing %d orders and %d missing orders...", orderIds.length, missingOrderIds.length
    );

    Order.find({_id: {$in: allOrderIds}}).exec(function(err, orderModels)
    {
      if (err)
      {
        module.error("Failed to fetch orders for comparison: %s", err.message);

        return unlock();
      }

      var insertList = [];
      var updateList = [];

      orderModels.forEach(compareOrder.bind(null, updateList, orders, missingOrders));

      createOrdersForInsertion(insertList, orders, missingOrders);

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

  function compareOrder(updateList, orders, missingOrders, orderModel)
  {
    var orderNo = orderModel._id;

    if (typeof orders[orderNo] === 'object')
    {
      compareOrderWithDoc(updateList, orderModel, orders[orderNo]);

      delete orders[orderNo];
    }
    else if (typeof missingOrders[orderNo] === 'object')
    {
      compareMissingOrderWithDoc(
        updateList, orderModel, missingOrders[orderNo]
      );

      delete missingOrders[orderNo];
    }
  }

  function compareOrderWithDoc(updateList, orderModel, order)
  {
    if (orderModel.get('importTs') > order.importTs)
    {
      return;
    }

    var different = false;
    var changes = {
      time: new Date(),
      user: null,
      oldValues: {},
      newValues: {}
    };

    Object.keys(order).forEach(function(key)
    {
      if (key === 'createdAt' || key === 'updatedAt' || key === 'importTs')
      {
        return;
      }

      var oldValue = orderModel.get(key);
      var newValue = order[key];

      if (oldValue != null && typeof oldValue.toObject === 'function')
      {
        oldValue = oldValue.toObject();
      }

      if (!deepEqual(oldValue, newValue, {strict: true}))
      {
        if (key === 'operations' && lodash.isEmpty(newValue))
        {
          return;
        }

        different = true;

        orderModel.set(key, newValue);

        changes.oldValues[key] = oldValue;
        changes.newValues[key] = newValue;
      }
    });

    if (different)
    {
      orderModel.changes.push(changes);

      updateList.push(orderModel);
    }
  }

  function compareMissingOrderWithDoc(updateList, orderModel, missingOrder)
  {
    if (orderModel.get('importTs') > missingOrder.importTs)
    {
      return;
    }

    var oldOperations = orderModel.get('operations');

    if (oldOperations === null)
    {
      oldOperations = [];
    }
    else
    {
      oldOperations = oldOperations.toObject();
    }

    if (!deepEqual(oldOperations, missingOrder.operations, {strict: true}))
    {
      orderModel.set('operations', missingOrder.operations);
      orderModel.changes.push({
        time: new Date(),
        user: null,
        oldValues: {operations: oldOperations},
        newValues: {operations: missingOrder.operations}
      });

      updateList.push(orderModel);
    }
  }

  function createOrdersForInsertion(insertList, orders, missingOrders)
  {
    Object.keys(orders).forEach(function(orderNo)
    {
      insertList.push(new Order(orders[orderNo]));
    });

    Object.keys(missingOrders).forEach(function(orderNo)
    {
      insertList.push(new Order(missingOrders[orderNo]));
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
      steps.push(lodash.partial(createOrdersStep, insertList.splice(0, 100)));
    }

    updateList.forEach(function(orderModel)
    {
      steps.push(lodash.partial(updateOrderStep, orderModel));
    });

    steps.push(function unlockStep(err)
    {
      if (err)
      {
        return module.error("Failed to sync data: %s", err.message);
      }

      module.info("Synced %d new and %d existing orders", createdOrdersCount, updatedOrdersCount);

      if (createdOrdersCount > 0 || updatedOrdersCount > 0)
      {
        app.broker.publish('orders.synced', {
          created: createdOrdersCount,
          updated: updatedOrdersCount
        });
      }

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

    Order.create(orders, this.next());
  }

  function updateOrderStep(orderModel, err)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.skip(err);
    }

    orderModel.save(this.next());
  }
};
