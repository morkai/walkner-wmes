/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kaizenproductfamilies.updateMany({owners: {$exists: true}}, {$unset: {owners: 1}});
db.kaizenproductfamilies.updateMany({coordSections: {$exists: false}}, {$set: {coordSections: []}});
