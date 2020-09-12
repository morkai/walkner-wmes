/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kanbanentries.find({}, {workstations: 1, locations: 1}).forEach(k =>
{
  while (k.workstations.length < 10)
  {
    k.workstations.push(0);
    k.locations.push('');
  }

  db.kanbanentries.updateOne({_id: k._id}, {$set: {
    workstations: k.workstations,
    locations: k.locations
  }});
});
