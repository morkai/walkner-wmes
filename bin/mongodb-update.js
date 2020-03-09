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

db.oldwhsetcarts.find({startTime: {$exists: false}}).forEach(setCart =>
{
  setCart.startTime = Number.MAX_SAFE_INTEGER;

  setCart.orders.forEach(o =>
  {
    const whOrder = db.oldwhorders.findOne({_id: o.whOrder});

    o.startTime = whOrder.startTime;

    if (o.startTime < setCart.startTime)
    {
      setCart.startTime = +o.startTime;
    }
  });

  db.oldwhsetcarts.updateOne({_id: setCart._id}, {$set: {
    orders: setCart.orders,
    startTime: new Date(setCart.startTime)
  }});
});
