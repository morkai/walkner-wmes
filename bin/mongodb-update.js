/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhlines.find({}).forEach(line =>
{
  var nextShiftAt = null;
  var startedPlan = new Date(0);

  var lastPso = db.prodshiftorders
    .find({
      $or: [
        {
          finishedAt: null,
          prodLine: line._id,
          'orderData.scheduledStartDate': {$exists: true}
        },
        {
          prodLine: line._id,
          startedAt: {$gt: new Date(Date.now() - 24 * 3600 * 7 * 1000)},
          quantityDone: {$gt: 0},
          'orderData.scheduledStartDate': {$exists: true}
        }
      ]
    })
    .projection({
      _id: 0,
      'orderData.scheduledStartDate': 1
    })
    .sort({prodLine: 1, startedAt: -1})
    .limit(1)
    .toArray()[0];

  if (lastPso)
  {
    var d = new Date(lastPso.orderData.scheduledStartDate);

    startedPlan = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  db.oldwhlines.updateOne({_id: line._id}, {$set: {nextShiftAt, startedPlan}});
});
