/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.paintshoporders.find({}, {childOrders: 1}).forEach(o =>
{
  o.childOrders.forEach(c =>
  {
    c.deleted = false;
  });

  db.paintshoporders.update({_id: o._id}, {$set: {childOrders: o.childOrders}});
});
