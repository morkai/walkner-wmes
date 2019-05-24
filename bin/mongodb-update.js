/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

print('luma2events');
db.luma2events.getIndexes().forEach(index =>
{
  if (index.name === '_id_')
  {
    return;
  }

  db.luma2events.dropIndex(index.name);
});

print('prodshiftorders');
db.prodshiftorders.updateMany({opWorkDuration: {$exists: false}}, {$set: {opWorkDuration: 0}});

print('pressworksheets');
db.pressworksheets.find({}).forEach(pw =>
{
  pw.orders.forEach(o =>
  {
    if (!o.opWorkDuration)
    {
      o.opWorkDuration = 0;
    }
  });

  db.pressworksheets.updateOne({_id: pw._id}, {$set: {orders: pw.orders}});
});
