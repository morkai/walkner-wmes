/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshemployments.find({}).forEach(doc =>
{
  doc.departments.forEach(dept =>
  {
    if (!Array.isArray(dept.observerUsers))
    {
      dept.observers = 0;
      dept.observerUsers = [];
    }
  });

  db.oshemployments.updateOne({_id: doc._id}, {$set: {departments: doc.departments}});
});
