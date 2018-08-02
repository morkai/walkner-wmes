// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/views/PaginationView',
  './KanbanPrintQueueListItemView',
  './KanbanPrintQueueDialogView',
  'app/kanbanPrintQueues/templates/list'
], function(
  _,
  $,
  t,
  user,
  viewport,
  View,
  PaginationView,
  KanbanPrintQueueListItemView,
  KanbanPrintQueueDialogView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.lastSpaceAt = 0;

      this.defineViews();
      this.defineBindings();

      this.setView('#-pagination', this.paginationView);
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    defineViews: function()
    {
      this.paginationView = new PaginationView({
        replaceUrl: false,
        model: this.collection.paginationData
      });
    },

    defineBindings: function()
    {
      $(window)
        .on('keydown.' + this.idPrefix, this.onWindowKeyDown.bind(this))
        .on('keyup.' + this.idPrefix, this.onWindowKeyUp.bind(this));

      this.listenTo(this.collection, 'reset', this.render);
      this.listenTo(this.collection, 'add', this.onAdd);
      this.listenTo(this.collection, 'print:next', this.printNext);
      this.listenTo(this.collection, 'print:specific', this.printSpecific);

      this.listenTo(this.collection.paginationData, 'change:page', this.scrollTop);
    },

    beforeRender: function()
    {
      var view = this;

      view.removeView('#-items');

      view.collection.forEach(function(printQueue)
      {
        view.insertView('#-items', new KanbanPrintQueueListItemView({
          model: printQueue
        }));
      });
    },

    refreshCollectionNow: function()
    {
      this.promised(this.collection.fetch({reset: true}));
    },

    scrollTop: function()
    {
      var y = this.$el.offset().top - 14;
      var $navbar = $('.navbar-fixed-top');

      if ($navbar.length)
      {
        y -= $navbar.outerHeight();
      }

      if (window.scrollY > y)
      {
        $('html, body').stop(true, false).animate({scrollTop: y});
      }
    },

    printNext: function(what)
    {
      if (!user.isAllowedTo('KANBAN:PRINT', 'KANBAN:MANAGE'))
      {
        return;
      }

      if (what)
      {
        this.collection.setPrintingWhat(what);
      }

      var $expanded = this.$('.is-expanded');

      if (!$expanded.length)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: this.t('msg:printNext:expand')
        });
      }

      var queue = this.collection.get($expanded[0].dataset.id);

      if (!queue.get('todo'))
      {
        return viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: this.t('msg:printNext:todo')
        });
      }

      var jobs = queue.get('jobs').filter(function(job) { return job.status === 'pending'; });

      switch (this.collection.getPrintingWhat())
      {
        case 'job':
          jobs = jobs.slice(0, 1);
          break;

        case 'line':
          var line = jobs.length ? jobs[0].line : null;

          jobs = jobs.filter(function(job) { return job.line === line; });
          break;
      }

      if (!jobs.length)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: this.t('msg:printNext:pending')
        });
      }

      this.printSpecific(queue, jobs);
    },

    printSpecific: function(queue, jobs)
    {
      viewport.showDialog(new KanbanPrintQueueDialogView({
        model: {
          queue: queue,
          jobs: jobs,
          groupByWorkstations: this.collection.getGroupByWorkstations()
        }
      }));
    },

    onAdd: function(printQueue)
    {
      this.insertView('#-items', new KanbanPrintQueueListItemView({
        model: printQueue
      }));
    },

    onWindowKeyDown: function(e)
    {
      if (document.activeElement !== document.body)
      {
        return;
      }

      if (e.key === 'ArrowDown')
      {
        this.toggleNext();

        return false;
      }

      if (e.key === 'ArrowUp')
      {
        this.togglePrev();

        return false;
      }

      if (e.key === ' ')
      {
        e.preventDefault();
      }
    },

    onWindowKeyUp: function(e)
    {
      if (document.activeElement !== document.body)
      {
        return;
      }

      if (e.key === ' ')
      {
        if (e.timeStamp - this.lastSpaceAt < 500 && !viewport.currentDialog)
        {
          this.printNext();
        }

        this.lastSpaceAt = e.timeStamp;

        return false;
      }
    },

    toggleNext: function()
    {
      var $expanded = this.$('.is-expanded');
      var $next;

      if ($expanded.length === 0)
      {
        $next = this.$el;
      }
      else
      {
        $next = $expanded.next();

        if (!$next.length)
        {
          $next = this.$el;
        }
      }

      $next.find('.kanbanPrintQueues-item-hd').first().click();
    },

    togglePrev: function()
    {
      var $expanded = this.$('.is-expanded');
      var $prev;

      if ($expanded.length === 0)
      {
        $prev = this.$('.kanbanPrintQueues-item').last();
      }
      else
      {
        $prev = $expanded.prev();

        if (!$prev.length)
        {
          $prev = this.$('.kanbanPrintQueues-item').last();
        }
      }

      $prev.find('.kanbanPrintQueues-item-hd').first().click();
    }

  });
});
