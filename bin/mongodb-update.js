/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kanbancomponents.updateMany({}, {$set: {usage: {null: 0}}});
