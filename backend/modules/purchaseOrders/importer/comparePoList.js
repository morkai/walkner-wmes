// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var deepEqual = require('deep-equal');
var step = require('h5.step');

module.exports = function comparePoList(app, importerModule, purchaseOrders, done)
{
  var PurchaseOrder = app[importerModule.config.mongooseId].model('PurchaseOrder');
  var orderIds = Object.keys(purchaseOrders);

  importerModule.debug("Comparing %d POs...", orderIds.length);

  if (orderIds.length === 0)
  {
    return done();
  }

  step(
    function findPosStep()
    {
      var conditions = {
        open: true
      };
      var fields = {
        _id: 1,
        'importedAt': 1,
        'items._id': 1,
        'items.completed': 1
      };

      PurchaseOrder.find(conditions, fields).lean().exec(this.parallel());
      PurchaseOrder.find({_id: {$in: orderIds}}).exec(this.parallel());
    },
    function closeOpenPosStep(err, openOrders, orderModels)
    {
      if (err)
      {
        importerModule.error("Failed to find POs for comparison: %s", err.message);

        return this.done(done, err);
      }

      this.importedAt = purchaseOrders[orderIds[0]].importedAt;

      var closedOrders = findClosedOrders(openOrders, purchaseOrders, this.importedAt);

      if (closedOrders.ids.length)
      {
        closeOpenOrders(closedOrders, this.importedAt, this);
      }

      this.closedOrderIds = closedOrders.ids;
      this.orderModels = orderModels;
    },
    function(err)
    {
      var closedOrderIds = this.closedOrderIds;

      if (err)
      {
        importerModule.error(
          "Failed to close %d POs [%s]: %s",
          closedOrderIds.length,
          closedOrderIds.join(', '),
          err.message
        );
      }
      else if (closedOrderIds.length)
      {
        importerModule.info(
          "Closed %d POs: %s",
          closedOrderIds.length,
          closedOrderIds.join(', ')
        );
      }

      var insertList = [];
      var updateList = [];

      _.forEach(this.orderModels, function(orderModel)
      {
        if (closedOrderIds.indexOf(orderModel._id) !== -1)
        {
          orderModel.open = false;
          _.forEach(orderModel.items, function(item)
          {
            item.completed = true;
          });
        }

        var orderDoc = purchaseOrders[orderModel._id];

        if (orderDoc)
        {
          delete purchaseOrders[orderModel._id];

          compareOrder(orderModel, orderDoc, updateList);
        }
      });

      _.forEach(purchaseOrders, function(purchaseOrder)
      {
        insertList.push(new PurchaseOrder(purchaseOrder));
      });

      this.insertList = insertList;
      this.updateList = updateList;
      this.orderModels = null;

      setImmediate(this.next());
    },
    function()
    {
      var i;
      var l = this.insertList.length;

      this.invalidInsert = 0;
      this.invalidUpdate = 0;

      if (l)
      {
        for (i = 0; i < l; ++i)
        {
          if (validateOrder(this.insertList[i]))
          {
            this.insertList[i].save(this.parallel());
          }
          else
          {
            ++this.invalidInsert;

            importerModule.warn("Invalid order for insert: %s", JSON.stringify(this.insertList[i]));
          }
        }
      }

      l = this.updateList.length;

      if (l)
      {
        for (i = 0; i < l; ++i)
        {
          if (validateOrder(this.updateList[i]))
          {
            this.updateList[i].save(this.parallel());
          }
          else
          {
            ++this.invalidUpdate;

            importerModule.warn("Invalid order for update: %s", JSON.stringify(this.updateList[i]));
          }
        }
      }
    },
    function(err)
    {
      if (err)
      {
        return importerModule.error(
          "Failed to sync %d new and %d existing POs: %s",
          this.insertList.length,
          this.updateList.length,
          err.stack
        );
      }

      var created = this.insertList.length - this.invalidInsert;
      var updated = this.updateList.length - this.invalidUpdate;

      importerModule.info("Synced %d new and %d existing POs", created, updated);

      app.broker.publish('purchaseOrders.synced', {
        created: created,
        updated: updated,
        closed: this.closedOrderIds.length,
        importedAt: this.importedAt,
        moduleName: importerModule.name
      });

      this.insertList = null;
      this.updateList = null;
      this.closedOrderIds = null;
    },
    done
  );

  function findClosedOrders(dbOpenOrders, sapOpenOrders, importedAt)
  {
    var ids = [];
    var oldImportedAt = [];
    var items = [];

    for (var i = 0, l = dbOpenOrders.length; i < l; ++i)
    {
      var dbOpenOrder = dbOpenOrders[i];
      var sapOpenOrder = sapOpenOrders[dbOpenOrder._id];

      if (sapOpenOrder === undefined && dbOpenOrder.importedAt < importedAt)
      {
        ids.push(dbOpenOrder._id);
        oldImportedAt.push(dbOpenOrder.importedAt);
        items.push(dbOpenOrder.items);
      }
    }

    return {
      ids: ids,
      oldImportedAt: oldImportedAt,
      items: items
    };
  }

  function closeOpenOrders(closedOrders, importedAt, step)
  {
    var updatedAt = new Date();

    _.forEach(closedOrders.ids, function(id, orderIndex)
    {
      var update = {
        $set: {
          open: false,
          updatedAt: updatedAt,
          importedAt: importedAt,
          scheduledAt: null
        },
        $push: {
          changes: {
            date: updatedAt,
            user: null,
            data: {
              open: [true, false],
              importedAt: [closedOrders.oldImportedAt[orderIndex], importedAt]
            }
          }
        }
      };

      var items = closedOrders.items[orderIndex];

      for (var i = 0, l = items.length; i < l; ++i)
      {
        var item = items[i];

        if (!item.completed)
        {
          var key = 'items/' + item._id + '/completed';

          update.$set['items.' + i + '.completed'] = true;
          update.$push.changes.data[key] = [false, true];
        }
      }

      PurchaseOrder.update({_id: id}, update, step.parallel());
    });
  }

  function compareOrder(orderModel, orderDoc, updateList)
  {
    if (orderModel.importedAt >= orderDoc.importedAt)
    {
      return;
    }

    var changes = {};

    _.forEach([
      'pOrg',
      'pGr',
      'plant',
      'vendor',
      'vendorName',
      'docDate'
    ], function(propertyName)
    {
      var oldValue = orderModel[propertyName];
      var newValue = orderDoc[propertyName];

      if (!deepEqual(newValue, oldValue))
      {
        orderModel[propertyName] = newValue;
        changes[propertyName] = [oldValue, newValue];
      }
    });

    var itemChanges = compareItems(orderModel.items, orderDoc.items, changes);

    if (itemChanges)
    {
      if (!orderModel.open && itemChanges === 'add')
      {
        orderModel.open = true;
        changes.open = [false, true];
      }

      orderModel.markModified('items');
    }

    if (Object.keys(changes).length)
    {
      changes.importedAt = [orderModel.importedAt, orderDoc.importedAt];
      orderModel.importedAt = orderDoc.importedAt;

      orderModel.changes.push({
        date: new Date(),
        user: null,
        data: changes
      });

      updateList.push(orderModel);
    }
  }

  function compareItems(oldItems, newItems, changes)
  {
    var changed = null;
    var newItemMap = {};

    _.forEach(newItems, function(newItem)
    {
      newItemMap[newItem._id] = newItem;
    });

    _.forEach(oldItems, function(oldItem, i)
    {
      if (compareItem(oldItem, i, newItemMap, changes))
      {
        changed = 'set';
      }
    });

    _.forEach(newItemMap, function(newItem, newItemId)
    {
      changes['items/' + newItemId] = [null, newItem];
      oldItems.push(newItem);

      changed = 'add';
    });

    if (changed === 'set' && oldItems.some(function(oldItem) { return !oldItem.completed; }))
    {
      changed = 'add';
    }

    return changed;
  }

  function compareItem(oldItem, i, newItemMap, changes)
  {
    var keyPrefix = 'items/' + oldItem._id;
    var newItem = newItemMap[oldItem._id];

    if (newItem)
    {
      delete newItemMap[oldItem._id];

      var changed = false;

      _.forEach([
        'qty',
        'unit',
        'nc12',
        'name',
        'schedule'
      ], function(propertyName)
      {
        var oldValue = oldItem[propertyName];
        var newValue = newItem[propertyName];

        if (oldValue && typeof oldValue.toObject === 'function')
        {
          oldValue = oldValue.toObject();
        }

        if (!deepEqual(newValue, oldValue))
        {
          changes[keyPrefix + '/' + propertyName] = [oldValue, newValue];
          oldItem[propertyName] = newValue;

          changed = true;
        }
      });

      if (oldItem.completed)
      {
        changes[keyPrefix + '/completed'] = [true, false];
        oldItem.completed = false;

        changed = true;
      }

      return changed;
    }

    if (!oldItem.completed)
    {
      changes[keyPrefix + '/completed'] = [false, true];
      oldItem.completed = true;

      return true;
    }

    return false;
  }

  function validateOrder(order)
  {
    return order.docDate && order.items.length;
  }
};
