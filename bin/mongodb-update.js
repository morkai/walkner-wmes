/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var testers = {};

db.snftests.updateMany({}, {$set: {bulbHolderPassed: false}});
