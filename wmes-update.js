/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.kanbanentries.find({}, {kanbanId: 1}).forEach(d =>
{
  if (Array.isArray(d.kanbanId))
  {
    return;
  }

  db.kanbanentries.update({_id: d._id}, {$set: {kanbanId: [d.kanbanId]}});
});

db.kanbanentries.update({}, {$set: {container: null}}, {multi: true});

db.kanbansupplyareas.find({}).forEach(d =>
{
  d.lineCount = 0;

  d.lines = d.lines.map(l =>
  {
    d.lineCount += l === '-' ? 0 : 1;

    if (l === 'MCL')
    {
      return 'McL';
    }

    return l;
  });

  db.kanbansupplyareas.update({_id: d._id}, d);
});
