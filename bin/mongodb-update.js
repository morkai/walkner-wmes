/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.comprelentries.dropIndex({'orders._id': 1});
db.comprelentries.createIndex({'orders.orderNo': 1});
db.comprelentries.createIndex({mrps: 1, status: 1, 'orders.orderNo': 1});
