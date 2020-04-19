/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhorders.updateMany({redirLine: {$exists: false}}, {$set: {redirLine: null, redirLines: []}});
db.oldwhsetcarts.updateMany({redirLine: {$exists: false}}, {$set: {redirLine: null, redirLines: []}});
db.oldwhlines.updateMany({redirLine: {$exists: false}}, {$set: {redirLine: null}});
db.oldwhdeliveredorders.updateMany({redirLine: {$exists: false}}, {$set: {redirLine: null}});
