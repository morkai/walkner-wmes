/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.osheventcategories.updateMany({kinds: {$exists: false}}, {$set: {kinds: []}});
db.osheventcategories.updateMany({materialLoss: {$exists: false}}, {$set: {materialLoss: false}});
db.oshreasoncategories.updateMany({eventCategories: {$exists: false}}, {$set: {eventCategories: []}});
