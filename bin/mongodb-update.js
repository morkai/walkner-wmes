/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhdeliveredorders.createIndex({whOrder: 1}, {background: true});

db.oldwhorders.updateMany({psDistStatus: {$exists: false}}, {$set: {psDistStatus: 'pending'}});
