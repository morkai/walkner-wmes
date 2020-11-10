/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.orderbommatchers.find({}).forEach(obm =>
{
  obm.components.forEach(c =>
  {
    if (!c.notPattern)
    {
      c.notPattern = '';
    }

    if (!c.optional)
    {
      c.optional = false;
    }

    if (!c.first)
    {
      c.first = false;
    }
  });

  db.orderbommatchers.updateOne({_id: obm._id}, {$set: {components: obm.components}});
});
