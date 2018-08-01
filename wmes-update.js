/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.kanbancomponents.update({newStorageBin: null}, {$set: {newStorageBin: ''}}, {multi: true});

db.kanbanentries.find({}, {deleted: 1}).forEach(d =>
{
  if (!d.deleted)
  {
    d.deleted = false;
  }

  db.kanbanentries.update({_id: d._id}, {$set: d});
});
