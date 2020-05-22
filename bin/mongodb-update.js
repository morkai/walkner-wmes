/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var from = new Date(24 * 3600 * 7 * 1000);

db.oldwhlines.find({}, {_id: 1}).forEach(line =>
{
  var r = db.prodshiftorders.aggregate([
    {$match: {startedAt: {$gte: from}, prodLine: line._id}},
    {$group: {
      _id: null,
      startDate: {
        $max: {
          $cond: {
            if: {
              $eq: [{$type: '$orderData.scheduledStartDate'}, 'string']
            },
            then: {
              $dateFromString: {
                dateString: '$orderData.scheduledStartDate'
              }
            },
            else: '$orderData.scheduledStartDate'
          }
        }
      }
    }}
  ]).toArray();

  var startDate = r.length ? new Date(r[0].startDate) : new Date(0);

  var startedPlan = new Date(Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  ));

  db.oldwhlines.updateOne({_id: line._id}, {$unset: {startedDate: 1}, $set: {startedPlan}});
});
