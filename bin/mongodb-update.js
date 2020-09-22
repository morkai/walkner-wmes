/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kaizenproductfamilies.updateMany({owners: {$exists: true}}, {$unset: {owners: 1}});
db.kaizenproductfamilies.updateMany({coordSections: {$exists: false}}, {$set: {coordSections: []}});
db.kaizenproductfamilies.insertOne({
  "_id": "OM",
  "position": 300,
  "active": true,
  "mrps": [],
  "coordSections": [
    {
      "funcs": [
        "process-engineer"
      ],
      "section": "OM",
      "mor": "all"
    }
  ],
  "name": "Obróbka mechaniczna (Tłocznia)",
  "__v": 0
});
db.kaizensections.insertOne({
  "_id": "OM",
  "active": true,
  "position": 4,
  "subdivisions": [
    new ObjectId("529f2654cd8eea9824000012"),
    new ObjectId("529f267acd8eea9824000016"),
    new ObjectId("529f268fcd8eea982400001a")
  ],
  "confirmers": [],
  "coordinators": [],
  "name": "Obróbka mechaniczna (Tłocznia)",
  "__v": 0
});
