/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.paintshoporders.updateMany({workOrders: {$exists: false}}, {$set: {workOrders: []}});

db.paintshoporders.createIndex({'workOrders.shift': 1});
