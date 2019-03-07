/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.paintshoporders.updateMany({qtyDlv: {$exists: false}}, {$set: {qtyDlv: 0}});
