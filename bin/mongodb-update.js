/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.browsererrors.updateMany({resolved: {$exists: false}}, {$set: {resolved: false}});
