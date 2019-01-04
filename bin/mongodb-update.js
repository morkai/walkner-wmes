/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.plansettings.find({'mrps.lines.workerCount': {$type: 'number'}}, {mrps: 1}).forEach(s =>
{
  s.mrps.forEach(mrp =>
  {
    mrp.lines.forEach(line =>
    {
      if (typeof line.workerCount === 'number')
      {
        line.workerCount = [line.workerCount, line.workerCount, line.workerCount];
      }
    });
  });

  db.plansettings.updateOne({_id: s._id}, {$set: {mrps: s.mrps}});
});
