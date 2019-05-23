/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.prodshiftorders.updateMany({opWorkDuration: {$exists: false}}, {$set: {opWorkDuration: 0}});

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
