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

db.qiresults.updateMany({standard: {$exists: false}}, {$set: {standard: ''}});

db.qifaults.updateMany({weight: {$exists: false}}, {$set: {weight: 0}});

db.qioqlweeks.updateMany({results: {$exists: false}}, {$set: {results: []}});
