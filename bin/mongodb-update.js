/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.gftpcbs.createIndex({code: 1, quantity: 1}, {unique: true});
db.gftpcbs.createIndex({productFamily: 1});
db.gftpcbs.createIndex({lampColor: 1});
db.gftpcbs.createIndex({ledCount: 1});
