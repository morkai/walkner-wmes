/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

const oldId = 'IR3III';
const newId = 'SM22';

db.plans.find({_id: {$gte: new Date('2018-08-07T00:00:00.000Z')}, 'lines._id': 'IR3III'}).forEach(plan =>
{
  var settings = db.plansettings.findOne({_id: plan._id});

  plan.lines.forEach(line =>
  {
    if (line._id === oldId)
    {
      line._id = newId;
    }
  });

  settings.lines.forEach(line =>
  {
    if (line._id === oldId)
    {
      line._id = newId;
    }
  });

  settings.mrps.forEach(mrp =>
  {
    mrp.lines.forEach(line =>
    {
      if (line._id === oldId)
      {
        line._id = newId;
      }
    });
  });

  db.plans.updateOne({_id: plan._id}, {$set: {lines: plan.lines}});
  db.plansettings.updateOne({_id: plan._id}, {$set: {lines: settings.lines, mrps: settings.mrps}});
});
