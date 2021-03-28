/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kaizensections.updateMany({entryTypes: {$exists: false}}, {$set: {
  entryTypes: ['kaizenOrders', 'suggestions', 'observations', 'minutes'],
  auditors: [],
  controlLists: []
}});
