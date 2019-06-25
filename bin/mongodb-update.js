/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.qiresults.find({mrp: {$exists: false}}, {orderNo: 1}).forEach(r =>
{
  var o = db.orders.findOne({_id: r.orderNo}, {mrp: 1});

  if (!o)
  {
    return;
  }

  db.qiresults.updateOne({_id: r._id}, {$set: {mrp: o.mrp}});
});
