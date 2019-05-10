/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.toolcaltools.find({}, {users: 1}).forEach(function(tool)
{
  db.toolcaltools.updateOne({_id: tool._id}, {$set: {
    users: tool.users.map(u =>
    {
      u.kind = u.kind || 'individual';

      return u;
    })
  }});
});

db.paintshoporders.find({}, {childOrders: 1}).forEach(pso =>
{
  pso.childOrders.forEach(childOrder =>
  {
    var sapOrder = db.orders.findOne({_id: childOrder.order}, {mrp: 1});

    childOrder.mrp = sapOrder ? sapOrder.mrp : null;
  });

  db.paintshoporders.updateOne({_id: pso._id}, {$set: {childOrders: pso.childOrders}});
});
