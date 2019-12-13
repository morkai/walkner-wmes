/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var doneOrders = {};

db.paintshoporders.find({date: {$gt: new Date(Date.now() - 60 * 24 * 3600 * 1000)}}, {order: 1}).forEach(psOrder =>
{
  var sapOrder = db.orders.findOne({_id: psOrder.order}, {changes: 1});
  var newChanges = [];
  var lastPsComment = '';

  sapOrder.changes.forEach(change =>
  {
    if (change.source !== 'ps')
    {
      newChanges.push(change);

      return;
    }

    if (!lastPsComment && !change.user.id && change.comment === 'Zresetowano.')
    {
      return;
    }

    if (!lastPsComment || lastPsComment !== change.comment)
    {
      lastPsComment = change.comment;

      newChanges.push(change);
    }
  });

  db.orders.updateOne({_id: sapOrder._id}, {$set: {changes: newChanges}});
});
