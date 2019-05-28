/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.users.updateMany({prodFunction: {$exists: false}}, {$set: {prodFunction: null}});
