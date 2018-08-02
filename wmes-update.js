/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.kanbanprintqueues.find().forEach(queue =>
{
  queue.jobs.forEach(job =>
  {
    if (!job.workstations)
    {
      job.workstations = [];
    }
  });

  db.kanbanprintqueues.update({_id: queue._id}, queue);
});
