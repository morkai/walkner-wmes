/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.prodshiftorders.createIndex({finishedAt: -1});

db.oldwhorders.updateMany({
  status: 'pending',
  date: {$lt: new Date('2020-05-01T00:00:00Z')}
}, {$set: {status: 'cancelled'}});

