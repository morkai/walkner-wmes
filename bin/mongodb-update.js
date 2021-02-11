/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.plansettings.updateMany(
  {minIncompleteDuration: {$exists: false}},
  {$set: {minIncompleteDuration: 0}}
);
