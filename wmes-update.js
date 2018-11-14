/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.orders.find({startDate: {$gte: new Date("2018-11-01T00:00:00")}, psStatus: {$ne: null}}, {changes: 1}).forEach(o =>
{
  const changes = o.changes.filter(
    c => !c.user || !(c.user.label === 'System' && c.source === 'ps' && Object.keys(c.oldValues).length === 0)
  );

  if (changes.length !== o.changes.length)
  {
    db.orders.update({_id: o._id}, {$set: {changes: changes}});
  }
});
