/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshpayouts.createIndex({createdAt: -1});
db.oshpayouts.createIndex({types: 1, createdAt: -1});
db.oshpayouts.createIndex({'recipients.id': 1, createdAt: -1});
db.oshpayouts.createIndex({'companies.id': 1, createdAt: -1});
db.oshpayouts.createIndex({'recipients.entries': 1});
