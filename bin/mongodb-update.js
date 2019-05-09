/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.toolcaltools.find({}, {users: 1}).forEach(function(tool)
{
  db.toolcaltools.updateOne({_id: tool._id}, {$set: {
    users: tool.users.map(u =>
    {
      u.kind = u.kind || 'individual';

      return u;
    })
  }});
});
