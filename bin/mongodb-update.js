/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kanbanentries.find({_id: {$type: 'number'}}).forEach(oldKanbanEntry =>
{
  db.kanbanentries.deleteOne({_id: oldKanbanEntry._id});

  const newKanbanEntry = {
    _id: oldKanbanEntry._id.toString(),
    createdAt: oldKanbanEntry.createdAt,
    updatedAt: oldKanbanEntry.updatedAt,
    updater: oldKanbanEntry.updater,
    kind: oldKanbanEntry.kind,
    container: oldKanbanEntry.container,
    nc12: oldKanbanEntry.nc12,
    supplyArea: oldKanbanEntry.supplyArea,
    workCenter: oldKanbanEntry.workCenter,
    componentQty: oldKanbanEntry.componentQty,
    kanbanId: oldKanbanEntry.kanbanId,
    storageType: oldKanbanEntry.storageType,
    workstations: oldKanbanEntry.workstations,
    locations: oldKanbanEntry.locations,
    discontinued: oldKanbanEntry.discontinued,
    deleted: oldKanbanEntry.deleted,
    split: 1,
    comment: oldKanbanEntry.comment,
    updates: oldKanbanEntry.updates,
    changes: oldKanbanEntry.changes
  };

  db.kanbanentries.insertOne(newKanbanEntry);
});

db.kanbanentries.createIndex({split: 1});

db.oldwhsetcarts.find({}, {orders: 1}).forEach(setCart =>
{
  const orders = {};

  setCart.orders.forEach(setCartOrder =>
  {
    orders[setCartOrder.whOrder] = setCartOrder;
  });

  const whOrders = db.oldwhorders.find({_id: {$in: Object.keys(orders)}}, {finishTime: 1, qty: 1}).toArray();

  whOrders.forEach(whOrder =>
  {
    orders[whOrder._id].finishTime = whOrder.finishTime;
    orders[whOrder._id].qty = whOrder.qty;
  });

  db.oldwhsetcarts.updateOne({_id: setCart._id}, {$set: {orders: setCart.orders}});
});
