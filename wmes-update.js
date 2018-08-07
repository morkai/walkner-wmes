/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.plansettings.update({}, {$set: {completedStatuses: ['DLV', 'CNF']}}, {multi: true});

db.kanbansupplyareas.find().forEach(sa =>
{
  if (typeof sa._id !== 'string')
  {
    return;
  }

  db.kanbansupplyareas.remove({_id: sa.name});
  db.kanbansupplyareas.insert({
    _id: new ObjectId(),
    name: sa._id,
    workCenter: '',
    family: sa.name,
    lineCount: sa.lineCount,
    lines: sa.lines
  });
});
