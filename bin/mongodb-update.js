/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.ctpces.dropIndex({line: 1, station: 1});
db.ctpces.createIndex({line: 1, station: 1, cart: 1, startedAt: -1});

db.componentlabels.updateMany({lines: {$exists: false}}, {$set: {lines: []}});
