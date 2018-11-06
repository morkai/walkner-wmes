/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.orderbommatchers.find({}).forEach(d =>
{
  d.components.forEach(c =>
  {
    c.missing = false;
  });

  db.orderbommatchers.replaceOne({_id: d._id}, d);
});
