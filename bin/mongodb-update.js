/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhdeliveredorders.dropIndex({sapOrder: 1, line: 1, qtyRemaining: 1, pceTime: 1});
db.oldwhdeliveredorders.dropIndex({line: 1, qtyRemaining: 1, pceTime: 1});

db.oldwhdeliveredorders.find({status: {$exists: false}}).forEach(o =>
{
  db.oldwhdeliveredorders.updateOne({_id: o._id}, {$set: {
    status: o.qtyRemaining ? 'todo' : 'done'
  }});
});
