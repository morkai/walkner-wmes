/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.prododwntimes.drop();
db.icporesults.drop();
db.hefflinestates.drop();

db.opinionsurveys.updateMany({lang: {$exists: false}}, {$set: {lang: {}}});

db.whorders.find({mrp: {$exists: false}}, {_id: 1, order: 1}).forEach(who =>
{
  const o = db.orders.findOne({_id: who.order}, {mrp: 1});

  if (o)
  {
    db.whorders.updateOne({_id: who._id}, {$set: {mrp: o.mrp}});
  }
});
