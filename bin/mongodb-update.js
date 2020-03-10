/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.componentlabels.updateMany({template: {$exists: false}}, {$set: {template: '32x16'}});

db.paintshoporders.find({}, {childOrders: 1}).forEach(psOrder =>
{
  const childOrders = {};

  psOrder.childOrders.forEach(childOrder =>
  {
    childOrders[childOrder._id] = childOrder;
  });

  db.orders.find({_id: {$in: Object.keys(childOrders)}}, {qty: 1, operations: 1}).forEach(sapOrder =>
  {
    childOrders[sapOrder._id].manHours = getManHours(sapOrder);
  });

  db.paintshoporders.updateOne({_id: psOrder._id}, {$set: {childOrders: psOrder.childOrders}});
});

function getManHours(order)
{
  const operation = order.operations.find(op => op.workCenter === 'PAINT');

  if (!operation)
  {
    return 0;
  }

  const manHours = (operation.laborTime / 100 * order.qty) + operation.laborSetupTime;

  return Math.round(manHours * 10000) / 10000;
}

db.oldwhpendingdeliveries.drop();
db.createCollection('oldwhpendingcomponents');
db.createCollection('oldwhpendingpackagings');
