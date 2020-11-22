/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.plans.find({}, {lines: 1}).forEach(plan =>
{
  plan.lines.forEach(l =>
  {
    l.orders.forEach(o =>
    {
      o.pceTimes = [];
    });
  });

  db.plans.updateOne({_id: plan._id}, {$set: {lines: plan.lines}});
});
