// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function ignorePrintJobRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const KanbanPrintQueue = mongoose.model('KanbanPrintQueue');

  const {queue, job} = req.body;

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

      if (job)
      {
        this.jobIndex = queue.jobs.findIndex(j => j._id === job);

        if (this.jobIndex === -1)
        {
          return this.skip(app.createError('Job not found.', 'NOT_FOUND', 404));
        }
      }

      this.queue = queue;
    },
    function()
    {
      const $set = {};

      if (job)
      {
        $set[`jobs.${this.jobIndex}.status`] = 'ignored';

        this.queue.jobs[this.jobIndex].status = 'ignored';

        this.completed = this.queue.jobs.every(job => job.status === 'finished' || job.status === 'ignored');

        if (this.completed)
        {
          $set.todo = false;
        }
      }
      else
      {
        $set.todo = false;
      }

      KanbanPrintQueue.collection.update({_id: queue}, {$set}, this.next());
    },
    function(err)
    {
      if (err)
      {
        return next(err);
      }

      const message = {
        queue: {
          _id: queue
        }
      };

      if (job)
      {
        message.job = {
          _id: job,
          status: 'ignored'
        };

        if (this.completed)
        {
          message.queue.todo = false;
        }
      }
      else
      {
        message.queue.todo = false;
      }

      res.sendStatus(204);

      app.broker.publish('kanban.printQueues.updated', message);
    }
  );
};
