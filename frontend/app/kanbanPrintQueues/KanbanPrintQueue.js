// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kanban/printQueues',

    clientUrlRoot: '#kanban/printQueues',

    topicPrefix: 'kanban.printQueues',

    privilegePrefix: 'KANBAN',

    nlsDomain: 'kanbanPrintQueues',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.shortId = obj._id.substr(0, 4) + '...' + obj._id.substr(-4);
      obj.lines = {};
      obj.kanbans = {};
      obj.jobCount = {
        total: obj.jobs.length,
        completed: 0,
        pending: 0,
        printing: 0,
        failure: 0,
        success: 0,
        ignored: 0
      };
      obj.layoutCount = {
        kk: 0,
        empty: 0,
        full: 0,
        wh: 0,
        desc: 0
      };

      obj.jobs.forEach(function(job)
      {
        obj.lines[job.line] = 1;
        obj.jobCount[job.status] += 1;

        job.shortId = job._id.substr(0, 4) + '...' + job._id.substr(-4);
        job.kanbanIds = [];

        job.kanbans.forEach(function(kanban)
        {
          kanban = kanban.toString();

          obj.kanbans[kanban] = 1;

          while (kanban.length < 5)
          {
            kanban = ' ' + kanban;
          }

          job.kanbanIds.push(kanban);
        });

        job.kanbanIds = job.kanbanIds.join(' ');
        job.layoutCount = {
          kk: 0,
          empty: 0,
          full: 0,
          wh: 0,
          desc: 0
        };

        job.layouts.forEach(function(layout)
        {
          obj.layoutCount[layout] += job.kanbans.length;
          job.layoutCount[layout] += job.kanbans.length;
        });
      });

      obj.lines = Object.keys(obj.lines);
      obj.kanbans = Object.keys(obj.kanbans);

      obj.jobCount.completed = obj.jobCount.ignored + obj.jobCount.success;

      if (obj.jobCount.printing)
      {
        obj.status = 'printing';
      }
      else if (obj.jobCount.completed === obj.jobCount.total)
      {
        obj.status = 'success';
      }
      else if (obj.jobCount.failure)
      {
        obj.status = 'failure';
      }
      else
      {
        obj.status = 'pending';
      }

      return obj;
    }

  });
});
