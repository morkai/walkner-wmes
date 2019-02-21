// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/kanbanPrintQueues/templates/dialog'
], function(
  $,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    dialogClassName: 'kanbanPrintQueues-dialog modal-static modal-no-keyboard',

    initialize: function()
    {
      this.current = null;
      this.remaining = this.buildRemainingQueue();
      this.jobTotal = this.remaining.length;

      this.listenTo(this.model.queue, 'change:jobs', this.onJobsChange);
    },

    destroy: function()
    {
      this.current = null;
    },

    afterRender: function()
    {
      if (this.current)
      {
        this.updateJob();
      }
      else
      {
        this.printNext();
      }
    },

    onJobsChange: function(queue, jobs)
    {
      if (this.current && jobs.indexOf(this.current.job) !== -1)
      {
        this.updateJob();
      }
    },

    updateJob: function()
    {
      this.$el.closest('.kanbanPrintQueues-dialog')[0].dataset.status = this.error
        ? 'failure'
        : this.current.job.status;

      this.el.innerHTML = template({
        idPrefix: this.idPrefix,
        workstation: this.current.workstation,
        job: this.current.job,
        jobNo: this.jobTotal - this.remaining.length,
        jobTotal: this.jobTotal,
        error: this.error
      });
    },

    printNext: function()
    {
      var view = this;

      view.current = view.remaining.shift();
      view.error = null;

      view.updateJob();

      var req = $.ajax({
        method: 'POST',
        url: '/kanban/printQueues;print',
        data: JSON.stringify({
          queue: view.model.queue.id,
          job: view.current.job._id,
          workstation: view.current.workstation,
          infoLabels: view.current.infoLabels
        })
      });

      req.fail(function()
      {
        if (!view.current)
        {
          return;
        }

        var error = req.responseJSON && req.responseJSON.error && req.responseJSON.error.code;

        if (!req.status)
        {
          error = 'CONNECTION';
        }
        else if (!t.has('kanbanPrintQueues', 'msg:print:' + error))
        {
          error = 'failure';
        }

        view.error = t('kanbanPrintQueues', 'msg:print:' + error);

        view.updateJob();
      });

      req.done(function()
      {
        if (!view.current)
        {
          return;
        }

        if (!view.remaining.length)
        {
          view.unlock();
        }
        else
        {
          view.timers.printNext = setTimeout(view.printNext.bind(view), 1);
        }
      });
    },

    unlock: function()
    {
      this.$el.closest('.modal').removeClass('modal-static modal-no-keyboard');

      this.timers.hide = setTimeout(this.closeDialog, 5000);
    },

    closeDialog: function() {},

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    buildRemainingQueue: function()
    {
      if (!this.model.groupByWorkstations)
      {
        return this.model.jobs.map(function(job)
        {
          return {
            job: job,
            workstation: null,
            infoLabels: []
          };
        });
      }

      var linesToWorkstations = {};

      this.model.jobs.forEach(function(job)
      {
        var lineToWorkstations = linesToWorkstations[job.line];

        if (!lineToWorkstations)
        {
          lineToWorkstations = linesToWorkstations[job.line] = {};
        }

        job.data.workstations.forEach(function(value, w)
        {
          if (!value)
          {
            return;
          }

          if (!lineToWorkstations[w])
          {
            lineToWorkstations[w] = [];
          }

          lineToWorkstations[w].push(job);
        });
      });

      var remaining = [];

      Object.keys(linesToWorkstations).forEach(function(line)
      {
        var workstations = Object.keys(linesToWorkstations[line]).sort().reverse();

        workstations.forEach(function(workstation)
        {
          var workstationJobs = linesToWorkstations[line][workstation];
          var layouts = {};

          workstationJobs.forEach(function(job)
          {
            job.layouts.forEach(function(layout)
            {
              layouts[layout] = 1;
            });
          });

          var lastIndex = workstationJobs.length - 1;

          workstationJobs.forEach(function(job, i)
          {
            remaining.push({
              job: job,
              workstation: +workstation,
              infoLabels: i === lastIndex ? Object.keys(layouts) : []
            });
          });
        });
      });

      return remaining;
    }

  });
});
