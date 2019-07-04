/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.plansettings.find({}, {mrps: 1}).forEach(s =>
{
  s.mrps.forEach(mrp =>
  {
    mrp.limitSmallOrders = mrp.limitSmallOrders || false;
  });

  db.plansettings.updateOne({_id: s._id}, {$set: {mrps: s.mrps}});
});
