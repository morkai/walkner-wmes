/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.orders.createIndex({delayReason: 1, scheduledStartDate: -1});
