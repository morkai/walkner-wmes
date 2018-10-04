/* eslint-disable */
/* global ObjectId,db,print */

'use strict';

db.qikinds.update({}, {$set: {order: true}}, {multi: true});

db.qikinds.insert({
  "_id": new ObjectId("5bb5f268108d460760773146"),
  "division": null,
  "name": "Szkolenie - ogólne dla nowych pracowników",
  "order": false,
  "__v": 0
});

db.qikinds.update({_id: new ObjectId("5bb5f268108d460760773146")}, {$set: {order: false}});

db.orders.insert({
  "_id": "000000000",
  "createdAt": "1970-01-01T00:00:00.000Z",
  "updatedAt": null,
  "nc12": "000000000000",
  "name": "Puste zlecenie",
  "mrp": "TEST",
  "qty": 0,
  "qtyDone": {
    "total": 0,
    "byLine": {},
    "byOperation": {}
  },
  "qtyMax": {},
  "unit": "PCE",
  "startDate": "1970-01-01T00:00:00.000Z",
  "finishDate": "1970-01-01T00:00:00.000Z",
  "tzOffsetMs": 0,
  "scheduledStartDate": "1970-01-01T00:00:00.000Z",
  "scheduledFinishDate": "1970-01-01T00:00:00.000Z",
  "leadingOrder": null,
  "salesOrder": null,
  "salesOrderItem": null,
  "priority": "",
  "description": null,
  "soldToParty": null,
  "sapCreatedAt": null,
  "statuses": ['DLFL', 'DLT', 'TECO', 'RELR', 'CSER', 'ERTR'],
  "statusesSetAt": {},
  "delayReason": null,
  "whStatus": "unknown",
  "whTime": null,
  "whDropZone": "",
  "operations": [],
  "documents": [],
  "bom": [],
  "changes": [],
  "importTs": "1970-01-01T00:00:00.000Z"
});
