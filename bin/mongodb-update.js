/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.plans.find({_id: {$gte: new Date('2018-11-01T00:00:00.000Z')}}, {lines: 1, orders: 1}).forEach(plan =>
{
  plan.orders = plan.orders.filter(o => o.mrp !== 'KE3');
  plan.lines = plan.lines.filter(l => l._id !== 'WB-1');

  db.plans.updateOne({_id: plan._id}, {$set: {
    orders: plan.orders,
    lines: plan.lines
  }});

  const settings = db.plansettings.findOne({_id: plan._id}, {mrps: 1, lines: 1});

  settings.mrps = settings.mrps.filter(m => m._id !== 'KE3');
  settings.lines = settings.lines.filter(l => l._id !== 'WB-1');

  db.plansettings.updateOne({_id: settings._id}, {$set: {
    mrps: settings.mrps,
    lines: settings.lines
  }});
});
