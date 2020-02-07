/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.whevents.renameCollection('oldwhevents', true);
db.whorders.renameCollection('oldwhorders', true);
db.whusers.renameCollection('oldwhusers', true);
