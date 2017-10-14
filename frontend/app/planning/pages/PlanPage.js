// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/time',
  'app/core/Model',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/users/ownMrps',
  'app/delayReasons/DelayReasonCollection',
  'app/planning/Plan',
  'app/planning/PlanSettings',
  'app/planning/PlanDisplayOptions',
  'app/planning/views/PlanFilterView',
  'app/planning/views/PlanMrpView',
  'app/planning/templates/planPage'
], function(
  _,
  $,
  t,
  viewport,
  time,
  Model,
  View,
  bindLoadingMessage,
  ownMrps,
  DelayReasonCollection,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  PlanFilterView,
  PlanMrpView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          href: '#planning/plans',
          label: t.bound('planning', 'BREADCRUMBS:base')
        },
        this.plan.getLabel()
      ];
    },

    actions: function()
    {
      var page = this;

      return [
        {
          label: t.bound('planning', 'PAGE_ACTION:changes'),
          icon: 'list-ol',
          href: '#planning/changes?sort(-date)&plan=' + page.plan.id
        },
        {
          label: t.bound('planning', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'PLANNING:MANAGE',
          href: '#planning/settings/' + page.plan.id,
          className: page.plan.isEditable() ? '' : 'disabled',
          callback: function(e)
          {
            if (e.button === 0 && !e.ctrlKey && page.plan.isEditable())
            {
              page.broker.publish('router.navigate', {
                url: '/planning/settings/' + page.plan.id + '?back=1',
                trigger: true,
                replace: false
              });

              return false;
            }
          }
        }
      ];
    },

    remoteTopics: {
      'planning.changes.created': function(planChange)
      {
        this.plan.applyChange(planChange);
      },
      'planning.generator.started': function(message)
      {
        if (message.date === this.plan.id)
        {
          viewport.msg.loading();
        }
      },
      'planning.generator.finished': function(message)
      {
        if (message.date === this.plan.id)
        {
          viewport.msg.loaded();
        }
      },
      'orders.synced': function()
      {
        this.reloadOrders();
      },
      'orders.updated.*': function(message)
      {
        var lateOrder = this.plan.lateOrders.get(message._id);

        if (lateOrder && typeof message.change.newValues.delayReason !== 'undefined')
        {
          lateOrder.set('delayReason', message.change.newValues.delayReason);
        }
      }
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    defineModels: function()
    {
      this.delayReasons = new DelayReasonCollection();

      this.plan = new Plan({_id: this.options.date}, {
        displayOptions: PlanDisplayOptions.fromLocalStorage({
          mrps: this.options.mrps
        }),
        settings: PlanSettings.fromDate(this.options.date),
        minMaxDates: true,
        pceTimes: false
      });

      bindLoadingMessage(this.plan, this, 'MSG:LOADING_PLAN_FAILURE');
      bindLoadingMessage(this.plan.settings, this, 'MSG:LOADING_SETTINGS_FAILURE');
      bindLoadingMessage(this.plan.sapOrders, this, 'MSG:LOADING_SAP_ORDERS_FAILURE');

      window.plan = this.plan;
    },

    defineViews: function()
    {
      this.filterView = new PlanFilterView({plan: this.plan});

      this.setView('#-filter', this.filterView);
    },

    defineBindings: function()
    {
      var page = this;
      var plan = page.plan;

      page.listenTo(plan, 'change:loading', page.onLoadingChanged);
      page.listenTo(plan, 'change:_id', page.onDateFilterChanged);

      page.listenTo(plan.displayOptions, 'change:mrps', page.onMrpsFilterChanged);
      page.listenTo(plan.displayOptions, 'change:wrapLists', page.onWrapListsChanged);
      page.listenTo(plan.displayOptions, 'change:useLatestOrderData', page.updateUrl);

      page.listenTo(plan.settings, 'changed', page.onSettingsChanged);
      page.listenTo(plan.settings, 'errored', page.reload);

      page.listenTo(plan.mrps, 'reset', _.after(2, _.debounce(page.renderMrps.bind(page), 1)));

      page.listenTo(plan.sapOrders, 'sync', page.onSapOrdersSynced);

      $(window)
        .on('resize.' + page.idPrefix, _.debounce(page.onWindowResize.bind(page), 16))
        .on('keyup.' + page.idPrefix, page.onWindowKeyUp.bind(page));
    },

    load: function(when)
    {
      var plan = this.plan;

      return when(
        ownMrps.load(this),
        this.delayReasons.fetch({reset: true}),
        plan.settings.fetch(),
        plan.sapOrders.fetch({reset: true}),
        plan.lateOrders.fetch({reset: true}),
        plan.fetch()
      );
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        wrap: this.plan.displayOptions.isListWrappingEnabled()
      };
    },

    afterRender: function()
    {
      this.renderMrps();
    },

    reload: function()
    {
      var page = this;
      var plan = page.plan;

      plan.set('loading', true);

      page.promised(plan.settings.set('_id', plan.id).fetch()).then(
        function()
        {
          var promise = $.when(
            plan.sapOrders.fetch({reset: true, reload: true}),
            plan.lateOrders.fetch({reset: true, reload: true}),
            plan.fetch()
          );

          page.promised(promise).then(
            plan.set.bind(plan, 'loading', false),
            loadingFailed
          );
        },
        loadingFailed
      );

      function loadingFailed()
      {
        plan.set('loading', false);

        viewport.msg.loadingFailed();
      }
    },

    updateUrl: function()
    {
      var plan = this.plan;

      this.broker.publish('router.navigate', {
        url: '/planning/plans/' + plan.id
          + '?mrps=' + plan.displayOptions.get('mrps')
          + '&sapOrders=' + (plan.displayOptions.isLatestOrderDataUsed() ? '1' : '0'),
        replace: true,
        trigger: false
      });
    },

    renderMrps: function()
    {
      var page = this;

      page.removeView('#-mrps');

      page.plan.mrps.forEach(function(mrp)
      {
        var mrpView = new PlanMrpView({
          delayReasons: page.delayReasons,
          plan: page.plan,
          mrp: mrp
        });

        page.insertView('#-mrps', mrpView).render();
      });

      this.$id('empty').toggleClass('hidden', page.plan.mrps.length > 0);
      this.$id('mrps').toggleClass('hidden', page.plan.mrps.length === 0);
    },

    reloadOrders: function()
    {
      this.promised(this.plan.lateOrders.fetch({reset: true}));
      this.promised(this.plan.sapOrders.fetch({reset: true}));
    },

    onDateFilterChanged: function()
    {
      if (this.layout)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
        this.layout.setActions(this.actions, this);
      }

      this.updateUrl();
      this.reload();
    },

    onMrpsFilterChanged: function()
    {
      this.updateUrl();
      this.plan.mrps.reset();
    },

    onWrapListsChanged: function()
    {
      this.$el.toggleClass('wrap', this.plan.displayOptions.isListWrappingEnabled());
    },

    onLoadingChanged: function()
    {
      if (!this.plan.get('loading'))
      {
        this.renderMrps();
      }
    },

    onSettingsChanged: function(changed)
    {
      if (changed.reset)
      {
        this.plan.mrps.reset();
      }
    },

    onSapOrdersSynced: function()
    {
      if (this.timers.reloadOrders)
      {
        clearTimeout(this.timers.reloadOrders);
      }

      this.timers.reloadOrders = setTimeout(this.reloadOrders.bind(this), 10 * 60 * 1000);
    },

    onWindowResize: function(e)
    {
      this.broker.publish('planning.windowResized', e);
    },

    onWindowKeyUp: function(e)
    {
      if (e.keyCode === 27)
      {
        this.broker.publish('planning.escapePressed');
      }
    }

  });
});
