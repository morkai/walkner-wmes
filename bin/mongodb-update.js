/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.orders.createIndex({delayReason: 1, scheduledStartDate: -1});

db.settings.update({_id: "fap.quickUsers"}, {
  $set: {
    "value": [
      {
        _id: 'C78830EC-0769-4CB0-A349-21EF46FBE9E5',
        label: 'Kontrola Jakości (QC)',
        users: [{
          "id": "55e01ae280b7a80409b334d3",
          "label": "Kontrola Jakości (QC)"
        }],
        funcs: ['quality_control']
      }
    ]
  }
});
