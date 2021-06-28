/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshrewards.updateMany({type: {$exists: false}}, {$set: {type: 'kaizen'}});
db.oshrewards.updateMany({count: {$exists: false}}, {$set: {count: 1}});
