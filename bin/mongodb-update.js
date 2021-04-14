/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshaudits.createIndex({date: -1});
db.oshaudits.createIndex({section: 1});
db.oshaudits.createIndex({'auditor.id': 1});
db.oshaudits.createIndex({users: 1});

db.oshtalks.createIndex({date: -1});
db.oshtalks.createIndex({section: 1});
db.oshtalks.createIndex({'auditor.id': 1});
db.oshtalks.createIndex({'participants.id': 1});
db.oshtalks.createIndex({users: 1});
