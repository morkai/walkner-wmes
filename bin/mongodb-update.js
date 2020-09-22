/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhlines.deleteMany({_id: {$in: [
  'CT1/2',
  'CT3/4',
  'CT5/6'
]}});

db.oldwhorders.find({date: {$gte: new Date('2020-09-21T00:00:00Z')}}, {order: 1, psStatus: 1}).forEach(whOrder =>
{
  var sapOrder = db.orders.findOne({_id: whOrder.order}, {psStatus: 1});

  if (!sapOrder)
  {
    return;
  }

  if (sapOrder.psStatus === whOrder.psStatus)
  {
    return;
  }

  db.oldwhorders.updateOne({_id: whOrder._id}, {$set: {psStatus: sapOrder.psStatus}});
});
