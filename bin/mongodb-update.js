/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshdepartments.find({manager: {$exists: true}}).forEach(d =>
{
  d.managers = [d.managers];

  db.oshdepartments.updateOne({_id: d._id}, {
    $unset: {manager: 1},
    $set: {managers: [d.manager]}
  });
});
