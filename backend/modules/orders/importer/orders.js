// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var _ = require('lodash');
var deepEqual = require('deep-equal');
var step = require('h5.step');
var createParser = require('./createParser');
var parseOperationTimeCoeffs = require('../parseOperationTimeCoeffs');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^T_WMES_(ORDERS|OPERS)_([0-9]+)\.txt$/,
  parsedOutputDir: null,
  orderDocumentsFilePathPattern: './{timestamp}@T_COOIS_DOCS.txt'
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
    importTs: true,
    description: true,
    soldToParty: true,
    sapCreatedAt: true,
    qtyDone: true
  };
  var ORDER_DOCUMENTS_FILE_PATH_PATTERN = module.config.orderDocumentsFilePathPattern;

  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("orders/importer/orders module requires the mongoose module!");
  }

  var Order = mongoose.model('Order');
  var OrderIntake = mongoose.model('OrderIntake');
  var XiconfOrder = mongoose.model('XiconfOrder');
  var DailyMrpPlan = mongoose.model('DailyMrpPlan');
  var Setting = mongoose.model('Setting');
  var queue = [];
  var lock = false;

  createParser(app, module, enqueueAndCompare);

  function enqueueAndCompare(err, orders, missingOrders)
  {
    if (orders && missingOrders && (_.size(orders) || _.size(missingOrders)))
    {
      queue.push(orders, missingOrders);

      compareNext();
    }
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
    var timestamp = (orders[allOrderIds[0]] || missingOrders[allOrderIds[0]]).importTs;

    module.debug("Comparing %d orders and %d missing orders...", orderIds.length, missingOrderIds.length);

    step(
      function()
      {
        Setting.findById('orders.operations.timeCoeffs').lean().exec(this.next());
      },
      function(err, setting)
      {
        this.mrpToTimeCoeffs = setting ? parseOperationTimeCoeffs(setting.value) : {};

        Order.find({_id: {$in: allOrderIds}}).lean().exec(this.next());
      },
      function(err, orderModels)
      {
        if (err)
        {
          module.error("Failed to fetch orders for comparison: %s", err.message);

          return unlock();
        }

        var ts = new Date();
        var insertList = [];
        var updateList = [];
        var ordersWithNewQty = [];
        var ordersForDailyMrpPlans = {};

        _.forEach(orderModels, compareOrder.bind(
          null,
          ts,
          this.mrpToTimeCoeffs,
          updateList,
          orders,
          missingOrders,
          ordersWithNewQty,
          ordersForDailyMrpPlans
        ));

        createOrdersForInsertion(ts, insertList, orders, missingOrders);

        setImmediate(prepareOrderIntakeSearch, insertList, updateList);
        setImmediate(updateXiconfOrderQty, timestamp, ordersWithNewQty);
        setImmediate(updateDailyMrpPlans, ordersForDailyMrpPlans);
      }
    );
  }

  function unlock()
  {
    lock = false;

    if (queue.length !== 0)
    {
      setImmediate(compareNext);
    }
  }

  function compareOrder(
    ts,
    mrpToTimeCoeffs,
    updateList,
    orders,
    missingOrders,
    ordersWithNewQty,
    ordersForDailyMrpPlans,
    orderModel
  )
  {
    var orderNo = orderModel._id;

    if (typeof orders[orderNo] === 'object')
    {
      compareOrderWithDoc(
        ts,
        mrpToTimeCoeffs,
        updateList,
        orderModel,
        orders[orderNo],
        ordersWithNewQty,
        ordersForDailyMrpPlans
      );

      delete orders[orderNo];
    }
    else if (typeof missingOrders[orderNo] === 'object')
    {
      compareMissingOrderWithDoc(ts, mrpToTimeCoeffs, updateList, orderModel, missingOrders[orderNo]);

      delete missingOrders[orderNo];
    }
  }

  function compareOrderWithDoc(
    ts,
    mrpToTimeCoeffs,
    updateList,
    orderModel,
    newOrderData,
    ordersWithNewQty,
    ordersForDailyMrpPlans
  )
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

    adjustOperationTimes(newOrderData.operations, mrpToTimeCoeffs[newOrderData.mrp]);

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

      if (changes.newValues.qty)
      {
        ordersWithNewQty.push(orderModel._id);
      }

      if (shouldUpdateDailyMrpPlan(changes.oldValues, changes.newValues))
      {
        ordersForDailyMrpPlans[orderModel._id] = {
          qty: changes.newValues.qty || orderModel.qty,
          qtyDone: orderModel.qtyDone,
          statuses: changes.newValues.statuses || orderModel.statuses
        };
      }
    }
  }

  function shouldUpdateDailyMrpPlan(oldValues, newValues)
  {
    if (newValues.qty)
    {
      return true;
    }

    if (!newValues.statuses)
    {
      return false;
    }

    if (!_.includes(oldValues.statuses, 'CNF') && _.includes(newValues.statuses, 'CNF'))
    {
      return true;
    }

    if (!_.includes(oldValues.statuses, 'DLV') && _.includes(newValues.statuses, 'DLV'))
    {
      return true;
    }

    return false;
  }

  function compareMissingOrderWithDoc(ts, mrpToTimeCoeffs, updateList, orderModel, missingOrder)
  {
    if (orderModel.importTs > missingOrder.importTs)
    {
      return;
    }

    adjustOperationTimes(missingOrder.operations, mrpToTimeCoeffs[orderModel.mrp]);

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

  function adjustOperationTimes(operations, timeCoeffs)
  {
    if (!operations || !timeCoeffs)
    {
      return;
    }

    var laborCoeff = timeCoeffs.labor || 1;
    var laborSetupCoeff = timeCoeffs.laborSetup || 1;
    var machineCoeff = timeCoeffs.machine || 1;
    var machineSetupCoeff = timeCoeffs.machineSetup || 1;

    _.forEach(operations, function(operation)
    {
      operation.laborTime = Math.round(operation.laborTime * laborCoeff * 1000) / 1000;
      operation.laborSetupTime = Math.round(operation.laborSetupTime * laborSetupCoeff * 1000) / 1000;
      operation.machineTime = Math.round(operation.machineTime * machineCoeff * 1000) / 1000;
      operation.machineSetupTime = Math.round(operation.machineSetupTime * machineSetupCoeff * 1000) / 1000;
    });
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

  function prepareOrderIntakeSearch(insertList, updateList)
  {
    var intakeKeyToIdMap = {};
    var intakeKeyToOrderMap = {};

    for (var i = 0; i < insertList.length; ++i)
    {
      var order = insertList[i];
      var salesOrder = order.salesOrder;
      var salesOrderItem = order.salesOrderItem;

      if (salesOrder && salesOrderItem)
      {
        var intakeKey = salesOrder + '/' + salesOrderItem;

        intakeKeyToIdMap[intakeKey] = {no: salesOrder, item: salesOrderItem};
        intakeKeyToOrderMap[intakeKey] = order;
      }
    }

    setImmediate(assignOrderIntakeData, _.values(intakeKeyToIdMap), intakeKeyToOrderMap, insertList, updateList);
  }

  function assignOrderIntakeData(intakeIds, intakeKeyToOrderMap, insertList, updateList)
  {
    step(
      function findOrderIntakesStep()
      {
        if (!intakeIds.length)
        {
          return this.skip();
        }

        OrderIntake.find({_id: {$in: intakeIds}}).lean().exec(this.next());
      },
      function assignOrderIntakeDataStep(err, orderIntakes)
      {
        if (err)
        {
          module.error("Failed to find order intakes: %s", err.message);

          return this.skip();
        }

        for (var i = 0; i < orderIntakes.length; ++i)
        {
          var orderIntake = orderIntakes[i];
          var intakeKey = orderIntake._id.no + '/' + orderIntake._id.item;
          var order = intakeKeyToOrderMap[intakeKey];

          Order.copyOrderIntake(order, orderIntake);
        }
      },
      function saveOrdersStep()
      {
        setImmediate(saveOrders, insertList, updateList);
      }
    );
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

    _.forEach(updateList, function(update)
    {
      steps.push(_.partial(updateOrderStep, update));
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

  function updateXiconfOrderQty(timestamp, ordersWithNewQty)
  {
    if (ordersWithNewQty.length === 0)
    {
      return;
    }

    step(
      function()
      {
        XiconfOrder.find({_id: {$in: ordersWithNewQty}, 'items.source': 'docs'}).lean().exec(this.next());
      },
      function(err, xiconfOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (xiconfOrders.length === 0)
        {
          return this.skip();
        }

        Order.find({_id: {$in: _.map(xiconfOrders, '_id')}}, {documents: 1}).lean().exec(this.next());
      },
      function(err, orders)
      {
        if (err)
        {
          return this.skip(err);
        }

        var filePath = ORDER_DOCUMENTS_FILE_PATH_PATTERN.replace('{timestamp}', Math.ceil(timestamp / 1000));
        var fileContents = [
          '-------------------------------------------------------------------------',
          '|Order    |Item|Document       |Description                             |',
          '-------------------------------------------------------------------------'
        ];

        for (var i = 0; i < orders.length; ++i)
        {
          var order = orders[i];
          var documents = order.documents;

          for (var ii = 0; ii < documents.length; ++ii)
          {
            var document = documents[ii];
            var row = [
              '',
              order._id,
              document.item,
              document.nc15,
              _.padEnd(document.name, 40, ' '),
              ''
            ];

            fileContents.push(row.join('|'));
          }
        }

        fileContents.push(fileContents[0]);

        fs.writeFile(filePath, fileContents.join('\r\n'), this.next());
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to update quantities of XiconfOrders: ${err.message}`);
        }
      }
    );
  }

  function updateDailyMrpPlans(importedOrders)
  {
    step(
      function()
      {
        const conditions = {
          'orders._id': {$in: Object.keys(importedOrders)}
        };
        const fields = {
          orders: 1
        };

        DailyMrpPlan
          .find(conditions, fields)
          .lean()
          .exec(this.next());
      },
      function(err, dailyMrpPlans)
      {
        if (err)
        {
          return this.skip(err);
        }

        const planToOrders = {};
        const orderToPlans = {};
        const remainingOrders = [];

        _.forEach(dailyMrpPlans, function(dailyMrpPlan)
        {
          const map = {};

          _.forEach(dailyMrpPlan.orders, function(planOrder)
          {
            const importedOrder = importedOrders[planOrder._id];

            map[planOrder._id] = planOrder;

            if (importedOrder)
            {
              planOrder.qtyTodo = importedOrder.qty;
              planOrder.qtyDone = importedOrder.qtyDone ? importedOrder.qtyDone.total : 0;
              planOrder.statuses = importedOrder.statuses;
            }
            else
            {
              remainingOrders.push(planOrder._id);

              if (!orderToPlans[planOrder._id])
              {
                orderToPlans[planOrder._id] = [];
              }

              orderToPlans[planOrder._id].push(dailyMrpPlan._id);
            }
          });

          planToOrders[dailyMrpPlan._id] = {
            list: dailyMrpPlan.orders,
            map: map
          };
        });

        this.planToOrders = planToOrders;
        this.orderToPlans = orderToPlans;
        this.remainingOrders = remainingOrders;

        setImmediate(this.next());
      },
      function()
      {
        const conditions = {
          _id: {$in: this.remainingOrders}
        };
        const fields = {
          qty: 1,
          'qtyDone.total': 1,
          statuses: 1
        };

        Order
          .find(conditions, fields)
          .lean()
          .exec(this.next());
      },
      function(err, remainingOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        remainingOrders.forEach(function(remainingOrder)
        {
          this.orderToPlans[remainingOrder._id].forEach(function(planId)
          {
            const planOrder = this.planToOrders[planId].map[remainingOrder._id];

            planOrder.qtyTodo = remainingOrder.qty;
            planOrder.qtyDone = remainingOrder.qtyDone ? remainingOrder.qtyDone.total : 0;
            planOrder.statuses = remainingOrder.statuses;
          }, this);
        }, this);

        setImmediate(this.next());
      },
      function()
      {
        this.updatedAt = Date.now();
        this.planIds = Object.keys(this.planToOrders);

        this.planIds.forEach(function(planId)
        {
          DailyMrpPlan.collection.update(
            {_id: planId},
            {$set: {
              updatedAt: this.updatedAt,
              orders: this.planToOrders[planId].list
            }},
            this.group()
          );
        }, this);
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to update DailyMrpPlans: ${err.message}`);
        }
        else
        {
          app.broker.publish('dailyMrpPlans.ordersUpdated', {
            updatedAt: this.updatedAt,
            planIds: this.planIds
          });
        }
      }
    );
  }
};
