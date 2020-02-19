/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhorders.find({}).forEach(whOrder =>
{
  if (Array.isArray(whOrder.lines) && whOrder.lines.length > 1)
  {
    return;
  }

  const lines = [{
    _id: whOrder.line,
    qty: whOrder.qty,
    pceTime: Math.ceil((whOrder.finishTime - whOrder.startTime) / whOrder.qty)
  }];

  db.oldwhorders.updateOne({_id: whOrder._id}, {$set: {lines}});
});
