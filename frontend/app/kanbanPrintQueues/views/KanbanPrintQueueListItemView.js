// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/kanbanPrintQueues/templates/item',
  'app/kanbanPrintQueues/templates/_hd',
  'app/kanbanPrintQueues/templates/_job',
  'app/kanbanPrintQueues/templates/ignoreDialog',
  'app/kanbanPrintQueues/templates/restoreDialog'
], function(
  _,
  $,
  time,
  viewport,
  View,
  DialogView,
  template,
  hdTemplate,
  jobTemplate,
  ignoreDialogTemplate,
  restoreDialogTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click #-hd': function(e)
      {
        if (!this.$(e.target).closest('.kanbanPrintQueues-actions').length)
        {
          this.model.collection.toggleExpand(this.model.id);
        }
      },

      'click #-print': function()
      {
        this.model.collection.toggleExpand(this.model.id, true);
        this.model.collection.trigger('print:next', this.$id('print')[0].dataset.what);
      },

      'click a[data-what]': function(e)
      {
        this.model.collection.toggleExpand(this.model.id, true);
        this.model.collection.trigger('print:next', e.currentTarget.dataset.what);
      },

      'click #-ignore': function()
      {
        this.model.collection.toggleExpand(this.model.id, false);
        this.showIgnoreDialog();

        return false;
      },

      'click #-restore': function()
      {
        this.showRestoreDialog();

        return false;
      },

      'click .btn[data-action="print"]': function(e)
      {
        var jobId = this.$(e.currentTarget).closest('tr')[0].dataset.id;
        var job = _.find(this.model.get('jobs'), function(job) { return job._id === jobId; });

        this.model.collection.trigger('print:specific', this.model, [job]);
      },

      'click .btn[data-action="ignore"]': function(e)
      {
        var jobId = this.$(e.currentTarget).closest('tr')[0].dataset.id;
        var job = _.find(this.model.get('jobs'), function(job) { return job._id === jobId; });

        this.showIgnoreDialog(job);
      }

    },

    initialize: function()
    {
      this.listenTo(this.model.collection, 'expand', this.onExpand);
      this.listenTo(this.model.collection, 'printing', this.onPrinting);

      this.listenTo(this.model, 'change:todo', this.onQueueChange);
      this.listenTo(this.model, 'change:jobs', this.onJobsChange);
    },

    getTemplateData: function()
    {
      return {
        renderHd: hdTemplate,
        renderJob: jobTemplate,
        expanded: this.model.collection.isExpanded(this.model.id),
        queue: this.model.serialize(),
        what: this.model.collection.getPrintingWhat()
      };
    },

    onExpand: function(queueId)
    {
      if (queueId === this.model.id)
      {
        this.$el.addClass('is-expanded');

        this.$id('hd')[0].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
      else
      {
        this.$el.removeClass('is-expanded');
      }
    },

    onPrinting: function(what)
    {
      this.$id('print').prop('data-what', what).find('span').text(this.t('action:print:' + what));
    },

    updateHd: function(queue)
    {
      this.el.dataset.status = queue.status;

      this.$id('hd').replaceWith(hdTemplate({
        idPrefix: this.idPrefix,
        helpers: this.getTemplateHelpers(),
        queue: queue,
        what: this.model.collection.getPrintingWhat()
      }));
    },

    updateJob: function(queue, job)
    {
      this.$('tr[data-id="' + job._id + '"]').replaceWith(jobTemplate({
        idPrefix: this.idPrefix,
        helpers: this.getTemplateHelpers(),
        queue: queue,
        job: job
      }));
    },

    onQueueChange: function()
    {
      if (this.model.changed.todo === false)
      {
        this.render();
      }
      else
      {
        this.updateHd(this.model.serialize());
      }
    },

    onJobsChange: function(model, jobs)
    {
      var view = this;

      if (model.changed.todo === false)
      {
        return;
      }

      var queue = model.serialize();

      if (model.changed.todo === undefined)
      {
        view.updateHd(queue);
      }

      jobs.forEach(function(job)
      {
        view.updateJob(queue, job);
      });
    },

    showIgnoreDialog: function(job)
    {
      var type = job ? 'job' : 'queue';
      var dialogView = new DialogView({
        template: ignoreDialogTemplate,
        model: {
          type: type
        }
      });

      this.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes')
        {
          this.ignore(job);
        }
      });

      viewport.showDialog(dialogView, this.t('ignore:title:' + type));
    },

    showRestoreDialog: function()
    {
      var dialogView = new DialogView({
        template: restoreDialogTemplate
      });

      this.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes')
        {
          this.restore();
        }
      });

      viewport.showDialog(dialogView, this.t('restore:title'));
    },

    ignore: function(job)
    {
      var view = this;
      var $btn = job
        ? view.$('tr[data-id="' + job._id + '"] .btn[data-action="ignore"]')
        : view.$id('ignore');
      var $icon = $btn.find('.fa');

      $btn.prop('disabled', true);
      $icon.removeClass('fa-ban').addClass('fa-spinner fa-spin');

      var req = view.ajax({
        method: 'POST',
        url: '/kanban/printQueues;ignore',
        data: JSON.stringify({
          queue: view.model.id,
          job: job ? job._id : null
        })
      });

      req.fail(function()
      {
        $btn.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('ignore:failure')
        });
      });

      req.always(function()
      {
        $icon.removeClass('fa-spinner fa-spin').addClass('fa-ban');
      });
    },

    restore: function()
    {
      var view = this;
      var $btn = view.$id('restore');
      var $icon = $btn.find('.fa');

      $btn.prop('disabled', true);
      $icon.removeClass('fa-plus').addClass('fa-spinner fa-spin');

      var req = view.ajax({
        method: 'POST',
        url: '/kanban/printQueues;restore',
        data: JSON.stringify({
          queue: view.model.id
        })
      });

      req.fail(function()
      {
        $btn.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('restore:failure')
        });
      });

      req.always(function()
      {
        $icon.removeClass('fa-spinner fa-spin').addClass('fa-plus');
      });
    }

  });
});
