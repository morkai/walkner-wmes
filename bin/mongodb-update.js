/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

const cond = {
  scheduledStartDate: {$gt: new Date('2020-01-31T00:00:00Z')},
  notes: {$exists: true, $ne: []}
};

db.orders.find(cond, {notes: 1}).forEach(o =>
{
  if (typeof o.notes[0] !== 'string')
  {
    return;
  }

  o.notes = o.notes.map(text => ({target: 'docs', priority: 'warning', text}));

  db.orders.updateOne({_id: o._id}, {$set: {notes: o.notes}});
});

db.paintshoporders.find({notes: {$exists: false}}).forEach(pso =>
{
  pso.childOrders.forEach(c => c.notes = []);

  db.paintshoporders.updateOne({_id: pso._id}, {$set: {notes: [], childOrders: pso.childOrders}});
});

db.oldwhorders.deleteMany({});
db.oldwhevents.deleteMany({});
