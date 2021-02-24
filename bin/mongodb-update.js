/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshkinds.updateOne({_id: 1}, {$set: {entryTypes: ['nearMiss', 'kaizen', 'action']}});
db.oshkinds.updateOne({_id: 2}, {$set: {entryTypes: ['nearMiss', 'kaizen', 'action']}});
db.oshkinds.updateOne({_id: 3}, {$set: {entryTypes: ['nearMiss', 'kaizen', 'action']}});
db.oshkinds.updateOne({_id: 4}, {$set: {entryTypes: ['kaizen']}});
