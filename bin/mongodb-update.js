/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshemployments.updateMany({locked: {$exists: false}}, {$set: {locked: false}});
