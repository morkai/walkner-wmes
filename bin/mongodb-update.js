/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.prodserialnumbers.createIndex({mrp: 1, startedAt: -1});
