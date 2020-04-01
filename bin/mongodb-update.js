/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.plansettings.find({}, {mrps: 1}).forEach(settings =>
{
  settings.mrps.forEach(mrp =>
  {
    if (mrp.hardBigComponents)
    {
      return;
    }

    mrp.hardBigComponents = mrp.hardComponents;
    mrp.hardComponents = [];
  });

  db.plansettings.updateOne({_id: settings._id}, {$set: {mrps: settings.mrps}});
});
