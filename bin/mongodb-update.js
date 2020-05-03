/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhorders.updateMany({date: {$lt: new Date('2020-05-01T00:00:00Z')}}, {$set: {status: 'cancelled'}});
