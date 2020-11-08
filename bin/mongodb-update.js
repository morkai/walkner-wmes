/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshactivitykinds.updateMany({resolution: {$exists: false}}, {$set: {resolution: 'none'}});
db.oshactivitykinds.updateMany({rootCauses: {$exists: true}}, {$unset: {rootCauses: 1}});
db.oshactivitykinds.updateMany({implementers: {$exists: true}}, {$unset: {implementers: 1}});
db.oshactivitykinds.updateMany({participants: {$exists: false}}, {$set: {participants: false}});
