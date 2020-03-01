/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhdowntimes.drop();
db.oldwhevents.drop();
db.oldwhlines.drop();
db.oldwhorders.drop();
db.oldwhsetcarts.drop();

db.downtimereasons.updateOne({_id: 'A'}, {$set: {
  "subdivisionTypes": [
    "assembly",
    "press",
    "paintShop",
    "wh-pickup",
    "wh-dist"
  ]
}});
