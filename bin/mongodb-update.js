/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kanbancomponents.updateMany({unit: {$exists: false}}, {$set: {unit: 'PCE'}});
