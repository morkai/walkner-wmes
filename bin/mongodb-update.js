/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.toolcaltools.updateMany({certificateFile: {$exists: false}}, {$set: {certificateFile: null}});
