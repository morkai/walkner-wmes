/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kanbanentries.updateMany({children: {$exists: true}}, {$unset: {children: 1}});

db.ctcarts.updateMany({type: {$exists: false}}, {$set: {type: 'other'}});

db.ctcarts.createIndex({type: 1});
