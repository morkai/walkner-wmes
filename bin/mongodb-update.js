/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.prodserialnumbers.distinct('orderNo').forEach(orderNo =>
{
  print(orderNo);

  var sapOrder = db.orders.findOne({_id: orderNo}, {_id: 0, mrp: 1});

  if (sapOrder)
  {
    db.prodserialnumbers.updateMany({orderNo}, {$set: {mrp: sapOrder.mrp}});
  }
});
