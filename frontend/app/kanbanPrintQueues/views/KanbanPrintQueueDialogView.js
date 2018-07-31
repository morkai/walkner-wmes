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

    dialogClassName: 'kanbanPrintQueues-dialog',

    initialize: function()
    {
      this.current = null;
      this.remaining = [].concat(this.model.jobs);

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

    onJobsChange: function(jobs)
    {
      if (jobs.indexOf(this.current) !== -1)
      {
        this.updateJob();
      }
    },

    updateJob: function()
    {
      this.$el.closest('.kanbanPrintQueues-dialog')[0].dataset.status = this.error ? 'failure' : this.current.status;

      this.el.innerHTML = template({
        idPrefix: this.idPrefix,
        job: this.current,
        jobNo: this.model.jobs.length - this.remaining.length,
        jobTotal: this.model.jobs.length,
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
          job: view.current._id
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

        if (t.has('kanbanPrintQueues', 'msg:print:' + error))
        {
          view.error = t('kanbanPrintQueues', 'msg:print:' + error);
        }

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
          view.timers.hide = setTimeout(view.closeDialog, 30000);
        }
        else
        {
          view.timers.printNext = setTimeout(view.printNext.bind(view), 1);
        }
      });
    },

    closeDialog: function() {},

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    }

  });
});
