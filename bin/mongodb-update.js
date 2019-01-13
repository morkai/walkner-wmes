/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.fapentries.find({}).forEach(entry =>
{
  entry.observers.forEach(o =>
  {
    o.notify = false;
    o.changes = {};
    o.lastSeenAt = new Date();
  });

  db.fapentries.updateOne({_id: entry._id}, {$set: {observers: entry.observers}});
});
