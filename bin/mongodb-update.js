/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.comprelentries.dropIndex({oldCode: 1});
db.comprelentries.createIndex({'oldComponents._id': 1});

db.comprelentries.find({oldCode: {$exists: true}}).forEach(entry =>
{
  entry.oldComponents = [{
    _id: entry.oldCode,
    name: entry.oldName
  }];

  entry.orders.forEach(o =>
  {
    o.validFrom = new Date('2000-01-01 00:00:00');
    o.validTo = new Date('2100-01-01 00:00:00');
  });

  delete entry.oldCode;
  delete entry.oldName;

  db.comprelentries.replaceOne({_id: entry._id}, entry);
});
