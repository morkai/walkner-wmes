/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson */

'use strict';

db.orders.find({startDate: {$gte: new Date("2018-08-01T00:00:00")}, psStatus: {$ne: null}}, {changes: 1}).forEach(o =>
{
  const changes = [];
  let changed = false;

  o.changes.forEach(change =>
  {
    if (change.user && change.source === 'ps')
    {
      const props = Object.keys(change.oldValues);

      if (change.user.label === 'System' && props.length === 0)
      {
        return;
      }

      if (props[0] === 'status')
      {
        change.oldValues.psStatus = change.oldValues.status;
        change.newValues.psStatus = change.newValues.status;

        delete change.oldValues.status;
        delete change.newValues.status;

        changed = true;
      }

      if (props.length && change.oldValues.psStatus === change.newValues.psStatus)
      {
        return;
      }

      if (change.user.label === 'System'
        && (change.oldValues.psStatus === 'new' || change.newValues.psStatus === 'new'))
      {
        return;
      }
    }

    changes.push(change);
  });

  if (changed || changes.length !== o.changes.length)
  {
    db.orders.updateOne({_id: o._id}, {$set: {changes: changes}});
  }
});
