/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.suggestions.updateMany({status: {$in: ['todo', 'paused']}}, {$set: {status: 'inProgress'}});

db.kaizensections.updateMany({coordinators: {$exists: false}}, {$set: {coordinators: []}});
db.kaizensections.updateMany({active: {$exists: false}}, {$set: {active: true}});
db.kaizencategories.updateMany({active: {$exists: false}}, {$set: {active: true}});
db.kaizenareas.updateMany({active: {$exists: false}}, {$set: {active: true}});
db.kaizenproductfamilies.updateMany({active: {$exists: false}}, {$set: {active: true}});
