/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.fapentries.dropIndex("moreAnalysis_1_analysisDone_1");

db.fapentries.updateMany({}, {$set: {unsubscribed: {}}});
