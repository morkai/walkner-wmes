/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.fapentries.updateOne({subCategory: {$exists: false}}, {subCategory: null});
