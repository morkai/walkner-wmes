/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.orderdocumentfiles.updateMany({mrps: {$exists: false}}, {$set: {mrps: []}});
db.orderdocumentfiles.createIndex({mrps: 1});
