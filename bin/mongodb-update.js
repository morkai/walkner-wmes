/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.plansettings.find({}).forEach(settings =>
{
  settings.lines.forEach(line =>
  {
    if (!line.workerCount)
    {
      line.workerCount = [0, 0, 0];
    }

    if (!line.orderPriority)
    {
      line.orderPriority = ['small', 'medium', 'big'];
    }

    if (!line.orderGroupPriority)
    {
      line.orderGroupPriority = [];
    }
  });

  settings.mrps.forEach(mrp =>
  {
    if (!mrp.linePriority)
    {
      mrp.linePriority = [];
    }

    if (!mrp.smallOrderQuantity)
    {
      mrp.smallOrderQuantity = 0;
    }

    if (!mrp.bigOrderQuantity)
    {
      mrp.bigOrderQuantity = 0;
    }
  });

  db.plansettings.updateOne({_id: settings._id}, {$set: {
    lines: settings.lines,
    mrps: settings.mrps
  }});
});
