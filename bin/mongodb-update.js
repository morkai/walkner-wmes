/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshemployments.find({}).forEach(doc =>
{
  doc.departments.forEach(d =>
  {
    if (d.count === undefined) return;

    d.internal = d.count;
    d.external = 0;
    d.absent = 0;
    d.total = d.count;
    d.observers = 0;

    delete d.count;
  });

  db.oshemployments.replaceOne({_id: doc._id}, doc);
});
