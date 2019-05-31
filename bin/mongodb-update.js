/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.users.updateMany({prodFunction: {$exists: false}}, {$set: {prodFunction: null}});

db.kanbancomponents.find({}, {storageBin: 1}).forEach(component =>
{
  var entry = db.kanbanentries.findOne({nc12: component._id}, {_id: 1});

  if (!entry && !component.newStorageBin)
  {
    db.kanbancomponents.deleteOne({_id: component._id});
  }
});

db.whorders.dropIndex('order_1_date_-1');

db.whorders.deleteMany({date: {$lt: new Date('2019-02-21T00:00:00.000Z')}});

db.whorders.find({psStatus: {$exists: false}}, {order: 1}).forEach(whOrder =>
{
  var sapOrder = db.orders.findOne({_id: whOrder.order});

  db.whorders.updateOne({_id: whOrder._id}, {
    $set: {
      psStatus: !sapOrder ? 'unknown' : sapOrder.psStatus
    },
    $unset: {
      painted: 1
    }
  });
});
