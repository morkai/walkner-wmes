/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.suggestions.updateMany({kaizenEvent: {$exists: false}}, {$set: {kaizenEvent: ''}});
db.suggestions.updateMany({productFamily: 'INNE'}, {$set: {productFamily: 'OTHER'}});
db.kaizenproductfamilies.deleteOne({_id: 'INNE'});
db.kaizenproductfamilies.insertOne({
  "_id": "OTHER",
  "position": 60,
  "owners": [],
  "name": "Inna",
  "__v": 0
});
