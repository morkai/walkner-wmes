/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.orders.updateMany({scheduledStartDate: {$gte: new Date('2020-05-01 00:00:00')}}, {$set: {tags: []}});
