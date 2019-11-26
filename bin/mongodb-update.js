/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';
db.kaizenorders.updateMany({relatedSuggestion: {$exists: false}}, {$set: {
  stdReturn: null,
  relatedSuggestion: null
}});
