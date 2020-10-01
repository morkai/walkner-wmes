/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhplanchanges.createIndex({'time': -1});
db.oldwhplanchanges.createIndex({'plan': -1});

db.oldwhsetcarts.find({'orders.qty': {$exists: false}}, {orders: 1}).forEach(setCart =>
{
  setCart.orders.forEach(o =>
  {
    var whOrder = db.oldwhorders.findOne({_id: o.whOrder}, {qty: 1});

    if (whOrder)
    {
      o.qty = whOrder.qty;
    }
  });

  db.oldwhsetcarts.updateOne({_id: setCart._id}, {$set: {orders: setCart.orders}});
});

db.oldwhorders.updateMany(
  {setDistStarted: {$exists: false}, distStatus: 'pending'},
  {$set: {setDistStarted: false}}
);

db.oldwhorders.updateMany(
  {setDistStarted: {$exists: false}, distStatus: {$in: ['started', 'finished']}},
  {$set: {setDistStarted: true}}
);
