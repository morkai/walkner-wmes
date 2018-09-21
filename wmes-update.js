/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.proddowntimes.createIndex({
  "orderData.mrp" : 1,
  "startedAt" : -1
}, {
  name: 'orderData.mrp_1_startedAt_-1',
  background: true
});
