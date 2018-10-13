/* eslint-disable */
/* global ObjectId,db,print */

'use strict';

db.orderbommatchers.find().forEach(obm =>
{
  obm.components.forEach(c =>
  {
    if (c.labelPattern)
    {
      return;
    }

    c.labelPattern = c.pattern;
    c.pattern = c.nc12;

    delete c.nc12;
  });

  db.orderbommatchers.update({_id: obm._id}, obm);
});
