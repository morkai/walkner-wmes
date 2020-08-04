/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.drillingorders.distinct('order').forEach(orderId =>
{
  var all = 0;
  var statuses = {
    new: 0,
    started: 0,
    partial: 0,
    finished: 0,
    aside: 0,
    cancelled: 0
  };

  db.drillingorders.find({order: orderId}, {_id: 0, status: 1}).forEach(o =>
  {
    all += 1;
    statuses[o.status] += 1;
  });

  var newStatus = 'new';

  if (statuses.partial)
  {
    newStatus = 'partial';
  }
  else if (statuses.started)
  {
    newStatus = 'started';
  }
  else if (statuses.aside === all)
  {
    newStatus = 'aside';
  }
  else if (statuses.finished)
  {
    newStatus = (statuses.finished + statuses.cancelled) === all ? 'finished' : 'partial';
  }
  else if (statuses.aside)
  {
    newStatus = 'aside';
  }
  else if (statuses.cancelled === all)
  {
    newStatus = 'cancelled';
  }

  db.orders.updateOne({_id: orderId}, {$set: {drillStatus: newStatus}});
  db.oldwhorders.updateMany({order: orderId, psStatus: 'unknown'}, {$set: {
    psStatus: newStatus,
    drilling: newStatus !== 'unknown'
  }});
});

db.oldwhorders.updateMany(
  {date: {$gt: new Date('2020-04-08T00:00:00Z')}, drilling: {$exists: false}},
  {$set: {drilling: false}}
);

db.orders.updateMany(
  {scheduledStartDate: {$gt: new Date('2020-04-08T00:00:00Z')}, drillStatus: {$exists: false}},
  {$set: {drillStatus: 'unknown'}}
);
