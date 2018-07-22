// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Collection',
  './KanbanPrintQueue'
], function(
  _,
  Collection,
  KanbanPrintQueue
) {
  'use strict';

  return Collection.extend({

    model: KanbanPrintQueue,

    rqlQuery: 'todo=true&sort(createdAt)&limit(15)',

    initialize: function()
    {
      this.expanded = null;
    },

    setUpPubsub: function(pubsub)
    {
      pubsub.subscribe('kanban.printQueues.*', this.handleMessage.bind(this));
    },

    handleMessage: function(message, topic)
    {
      switch (topic)
      {
        case 'kanban.printQueues.deleted':
          this.remove(this.get(message.model._id));
          break;

        case 'kanban.printQueues.added':
        case 'kanban.printQueues.edited':
        {
          var printQueue = this.get(message.model._id);

          if (printQueue)
          {
            printQueue.set(message.model);
          }
          else if (this.rqlQuery.skip === 0)
          {
            this.add(message.model);
          }

          break;
        }

        case 'kanban.printQueues.updated':
          this.handleUpdateMessage(message);
          break;
      }
    },

    handleUpdateMessage: function(message)
    {
      var queues = this;
      var queue = queues.get(message.queue._id);

      if (!queue)
      {
        return;
      }

      var jobsTodo = message.job ? [message.job] : message.jobs;
      var jobsDone = [];

      _.forEach(jobsTodo, function(newJob)
      {
        var job = _.find(queue.attributes.jobs, function(job) { return job._id === newJob._id; });

        if (job)
        {
          jobsDone.push(_.assign(job, newJob));
        }
      });

      queue.set(message.queue);

      if (jobsDone.length)
      {
        queue.trigger('change:jobs', jobsDone);
      }
    },

    isExpanded: function(queueId)
    {
      return this.expanded === queueId;
    },

    toggleExpand: function(queueId, newState)
    {
      if (queueId === this.expanded)
      {
        if (!newState)
        {
          this.expanded = null;
        }
      }
      else if (newState !== false)
      {
        this.expanded = queueId;
      }
      else
      {
        this.expanded = null;
      }

      this.trigger('expand', this.expanded);
    }

  });
});
