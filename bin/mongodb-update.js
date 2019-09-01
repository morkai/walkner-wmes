/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.minutesforsafetycards.updateMany({status: {$exists: true}}, {
  $unset: {status: 1},
  $set: {confirmer: null, risks: '', causes: []}
});

db.settings.insertMany([
  {
    "_id" : "wiring.workCenters",
    "__v" : 0,
    "updatedAt" : ISODate("2019-09-01T17:31:40.587+02:00"),
    "updater" : {
      "id" : ObjectId("583849c0e46f3a12bc9e5103"),
      "ip" : "192.168.1.250",
      "label" : "Walukiewicz ŁUKASZ"
    },
    "value" : [
      "WIRE A",
      "WIRE B",
      "WIRE C",
      "WIRE D"
    ]
  },
  {
    "_id" : "wiring.namePattern",
    "__v" : 0,
    "updatedAt" : ISODate("2019-09-01T17:31:31.787+02:00"),
    "updater" : {
      "id" : ObjectId("583849c0e46f3a12bc9e5103"),
      "ip" : "192.168.1.250",
      "label" : "Walukiewicz ŁUKASZ"
    },
    "value" : "^WIRE"
  }
]);
