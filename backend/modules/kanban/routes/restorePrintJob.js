// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function restorePrintJobRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const KanbanPrintQueue = mongoose.model('KanbanPrintQueue');

  const {queue} = req.body;

  step(
    function()
    {
      KanbanPrintQueue.findById({_id: queue}).lean().exec(this.next());
    },
    function(err, queue)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!queue)
      {
        return this.skip(app.createError('Queue not found.', 'NOT_FOUND', 404));
      }

      queue.jobs.forEach(job =>
      {
        job.status = 'pending';

        job.workstations = [];
      });

      queue.todo = true;

      this.queue = queue;

      KanbanPrintQueue.collection.updateOne({_id: queue._id}, queue, this.next());
    },
    function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);

      app.broker.publish('kanban.printQueues.updated', {
        queue: {
          _id: this.queue._id,
          todo: true
        },
        jobs: this.queue.jobs.map(job =>
        {
          return {
            _id: job._id,
            status: job.status,
            workstations: job.workstations
          };
        })
      });
    }
  );
};
