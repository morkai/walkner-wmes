/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.users.updateMany({}, {$set: {preferences: {}}});

db.fapentries.find({}).forEach(fap =>
{
  let solver = null;

  fap.changes.forEach(c =>
  {
    if (c.data.solution && c.data.solution[1])
    {
      solver = c.user;
    }
  });

  db.fapentries.updateOne({_id: fap._id}, {$set: {solver}});
});
