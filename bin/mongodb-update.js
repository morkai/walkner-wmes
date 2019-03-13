/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.ftemasterentries.find({'tasks.noPlan': true}).forEach(entry =>
{
  let changed = false;

  entry.tasks.forEach(task =>
  {
    if (!task.noPlan || task.total === 0)
    {
      return;
    }

    changed = true;

    task.total = 0;

    task.functions.forEach(fn =>
    {
      fn.companies.forEach(c =>
      {
        c.count = 0;
      });
    });
  });

  if (changed)
  {
    db.ftemasterentries.updateOne({_id: entry._id}, {$set: {tasks: entry.tasks}});
  }
});
