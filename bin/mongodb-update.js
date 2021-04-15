/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshaudits.find({}).forEach(doc =>
{
  doc.anyNok = false;
  doc.results.forEach(r =>
  {
    doc.anyNok = doc.anyNok || r.ok === false;

    delete r.owner;
  });

  db.oshaudits.replaceOne({_id: doc._id}, doc);
});
