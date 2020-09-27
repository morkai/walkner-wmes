/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

const t = Date.now();
const batchSize = 333;
let c = 0;
let pendingOrders = [];

db.orderzlf1.find({}, {_id: 1}).forEach(zlfOrder =>
{
  c += 1;

  pendingOrders.push(zlfOrder._id);

  if (pendingOrders.length === batchSize)
  {
    update(pendingOrders);
    pendingOrders = [];
  }
});

if (pendingOrders.length)
{
  update(pendingOrders);
}

print(`Done ${c} in ${(Date.now() - t) / 1000}s with batch size=${batchSize}`);

function update($in)
{
  const ops = [];

  db.orders.find({_id: {$in}}, {importTs: 1}).forEach(sapOrder =>
  {
    ops.push({
      updateOne: {
        filter: {_id: sapOrder._id},
        update: {$set: {ts: sapOrder.importTs}}
      }
    });
  });

  db.orderzlf1.bulkWrite(ops);
}
