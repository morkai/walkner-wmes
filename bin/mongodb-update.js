/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var count = 0;
while (nextSapOrders());

count = 0;
while (nextSalesOrders());

function nextSapOrders()
{
  var orders = db.orders.find({salesOrderDate: {$exists: false}}, {sapCreatedAt: 1}).limit(200).toArray();

  if (!orders.length)
  {
    return false;
  }

  var ops = orders.map(o =>
  {
    return {
      updateOne: {
        filter: {_id: o._id},
        update: {
          $set: {
            salesOrderDate: o.sapCreatedAt,
            sapCreatedAt: null
          }
        }
      }
    };
  });

  db.orders.bulkWrite(ops);

  count += ops.length;

  print(`orders ${count}`);

  return true;
}

function nextSalesOrders()
{
  var orders = db.orderintakes.find({salesOrderDate: {$exists: false}}, {sapCreatedAt: 1}).limit(200).toArray();

  if (!orders.length)
  {
    return false;
  }

  var ops = orders.map(o =>
  {
    return {
      updateOne: {
        filter: {_id: o._id},
        update: {
          $set: {
            salesOrderDate: o.sapCreatedAt
          },
          $unset: {
            sapCreatedAt: 1
          }
        }
      }
    };
  });

  db.orderintakes.bulkWrite(ops);

  count += ops.length;

  print(`sales ${count}`);

  return true;
}
