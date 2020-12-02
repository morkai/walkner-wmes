/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.comprelentries.dropIndex({mrps: 1, status: 1, 'orders.orderNo': 1});
db.comprelentries.createIndex({mrps: 1, status: 1});
db.comprelentries.createIndex({valid: 1});

db.comprelentries.find({valid: {$exists: false}}, {oldComponents: 1, orders: 1}).forEach(entry =>
{
  var oldComponents = [];

  entry.oldComponents.forEach(c => oldComponents.push(c._id));

  entry.valid = true;

  entry.orders.forEach(o =>
  {
    o.valid = !db.orders.findOne({
      _id: o.orderNo,
      'bom.nc12': {$in: oldComponents}
    }, {_id: 1});

    entry.valid = entry.valid && o.valid;
  });

  db.comprelentries.updateOne({_id: entry._id}, {$set: {valid: entry.valid, orders: entry.orders}});
});
