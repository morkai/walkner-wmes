/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

const localDate = new Date();
const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
const weekAgo = new Date(utcDate.getTime() - 7 * 24 * 3600 * 1000);

db.oldwhlines.updateMany({startedDate: {$exists: true}}, {$unset: {startedDate: 1}});
db.oldwhlines.updateMany({planDone: {$exists: false}}, {$set: {planDone: false}});

db.oldwhlines.find({}, {startedPlan: 1, planDone: 1}).forEach(line =>
{
  const startedPlan = line.startedPlan < utcDate ? utcDate : line.startedPlan;
  const whOrder = db.oldwhorders.findOne({
    status: 'pending',
    'lines._id': line._id,
    date: {
      $gte: weekAgo,
      $lte: startedPlan
    }
  }, {_id: 1});

  db.oldwhlines.updateOne({_id: line._id}, {$set: {planDone: !whOrder}});
});

db.suggestions.createIndex({'confirmer.id': 1});
