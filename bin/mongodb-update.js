/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.suggestions.updateMany({kom: {$exists: false}}, {$set: {kom: false}});
db.suggestions.createIndex({kom: 1});
db.suggestions.createIndex({finishedAt: -1});
