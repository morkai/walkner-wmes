/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.fapcategories.updateMany({reqFields: {$exists: false}}, {$set: {
  reqFields: {
    "assembly": {
      "orderNo": true,
      "lines": false,
      "componentCode": false
    },
    "press": {
      "orderNo": false,
      "lines": true,
      "componentCode": true
    },
    "wh": {
      "orderNo": false,
      "lines": false,
      "componentCode": true
    }
  }
}});

db.fapsubcategories.updateMany({reqFields: {$exists: false}}, {$set: {
  reqFields: {
    enabled: false,
    "assembly": {
      "orderNo": true,
      "lines": false,
      "componentCode": false
    },
    "press": {
      "orderNo": false,
      "lines": true,
      "componentCode": true
    },
    "wh": {
      "orderNo": false,
      "lines": false,
      "componentCode": true
    }
  }
}});

db.qiresults.find({}, {rootCause: 1, changes: 1}).forEach(r =>
{
  r.changes.forEach(c =>
  {
    if (c.data.rootCause)
    {
      if (Array.isArray(c.data.rootCause[0]) && !Array.isArray(c.data.rootCause[0][0]))
      {
        c.data.rootCause[0] = [c.data.rootCause[0]];
      }

      if (Array.isArray(c.data.rootCause[1]) && !Array.isArray(c.data.rootCause[1][0]))
      {
        c.data.rootCause[1] = [c.data.rootCause[1]];
      }
    }
  });

  db.qiresults.updateOne({_id: r._id}, {$set: {
    rootCause: Array.isArray(r.rootCause[0]) ? r.rootCause : [r.rootCause],
    changes: r.changes
  }});
});
