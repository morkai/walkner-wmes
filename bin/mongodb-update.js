/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhorders.find({}, {picklistDone: 1}).forEach(o =>
{
  let picklistDone = null;

  if (o.picklistDone === null)
  {
    picklistDone = 'pending';
  }
  else if (o.picklistDone === true)
  {
    picklistDone = 'success';
  }
  else if (o.picklistDone === false)
  {
    picklistDone = 'failure';
  }
  else
  {
    return;
  }

  db.oldwhorders.updateOne({_id: o._id}, {$set: {picklistDone}});
});

db.behaviorobscards.find({riskyBehaviors: {$exists: false}}).forEach(boc =>
{
  boc.riskyBehaviors = boc.observations.filter(o => !o.safe).map(o => o.id.replace(/-[0-9]{10,}$/, ''));

  db.behaviorobscards.updateOne({_id: boc._id}, {$set: {riskyBehaviors: boc.riskyBehaviors}});
});
