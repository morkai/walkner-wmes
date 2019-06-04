/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.fapentries.updateMany({level: {$exists: false}}, {$set: {level: 1}});

db.fapsubcategories.updateMany({planners: {$exists: false}}, {$set: {
  users: [],
  notifications: [],
  etoCategory: null,
  planners: false
}});
