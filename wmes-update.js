/* eslint-disable */
/* global ObjectId,db,print */

'use strict';

db.orderetos.find({}, {updatedAt: 1}).forEach(o =>
{
  if (typeof o.updatedAt !== 'string')
  {
    return;
  }

  db.orderetos.updateOne({_id: o._id}, {$set: {updatedAt: new Date(o.updatedAt)}});
});
