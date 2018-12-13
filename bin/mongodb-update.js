/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.delayreasons.find({}).forEach(dr =>
{
  db.delayreasons.updateOne({_id: dr._id}, {$unset: {notifications: 1}});

  delete dr.drm;

  db.fapcategories.insertOne(dr);
});
