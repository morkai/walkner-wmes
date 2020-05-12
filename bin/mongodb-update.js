/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhorders.dropIndex({'funcs.user.id': 1, 'funcs.status': 1, 'funcs.finishedAt': 1});
db.oldwhorders.dropIndex({psStatus: 1, date: -1});
db.oldwhorders.dropIndex({'lines._id': 1, date: -1});

var pendingOrders = {};

db.oldwhorders.find({status: {$in: ['pending', 'problem']}}, {order: 1}).forEach(whOrder =>
{
  pendingOrders[whOrder.order] = 1;
});

db.orders.find({_id: {$in: Object.keys(pendingOrders)}, statuses: {$nin: ['CNF', 'DLV', 'TECO', 'DLT', 'DLFL']}}, {_id: 1}).forEach(sapOrder =>
{
  delete pendingOrders[sapOrder._id];
});

db.oldwhorders.updateMany({order: {$in: Object.keys(pendingOrders)}}, {$set: {status: 'cancelled'}});
