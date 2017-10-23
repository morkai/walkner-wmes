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
  'app/delayReasons/DelayReasonCollection',
  'app/factoryLayout/productionState',
  '../Plan',
  '../PlanSettings',
  '../PlanDisplayOptions',
  '../views/PlanFilterView',
  '../views/PlanMrpView',
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
  DelayReasonCollection,
  productionState,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  PlanFilterView,
  PlanMrpView,
  template
) {
  'use strict';

  var reloadProdState = false;

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
          href: '#planning/changes?sort(date)&plan=' + page.plan.id
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
          this.$msg = viewport.msg.show({
            type: 'info',
            text: t('planning', 'MSG:GENERATING')
          });
        }
      },
      'planning.generator.finished': function(message)
      {
        var $msg = this.$msg;

        if ($msg && message.date === this.plan.id)
        {
          viewport.msg.hide($msg);

          this.$msg = null;
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
      },
      'shiftChanged': function(newShift)
      {
        this.plan.set('active', time.format(newShift.date, 'YYYY-MM-DD') === this.plan.id);
      },
      'production.stateChanged.**': function(message)
      {
        this.plan.shiftOrders.update(message);
      }
    },

    localTopics: {
      'socket.disconnected': function() { reloadProdState = true; },
      'planning.mrpStatsRecounted': 'scheduleStatRecount'
    },

    initialize: function()
    {
      this.$msg = null;

      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      productionState.unload();
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    defineModels: function()
    {
      var page = this;

      var plan = page.plan = new Plan({_id: page.options.date}, {
        displayOptions: PlanDisplayOptions.fromLocalStorage({
          mrps: page.options.mrps
        }),
        settings: PlanSettings.fromDate(page.options.date),
        minMaxDates: true,
        pceTimes: false
      });

      page.delayReasons = new DelayReasonCollection();

      bindLoadingMessage(plan, page, 'MSG:LOADING_FAILURE:plan');
      bindLoadingMessage(plan.settings, page, 'MSG:LOADING_FAILURE:settings');
      bindLoadingMessage(plan.lateOrders, page, 'MSG:LOADING_FAILURE:lateOrders');
      bindLoadingMessage(plan.sapOrders, page, 'MSG:LOADING_FAILURE:sapOrders');
      bindLoadingMessage(plan.shiftOrders, page, 'MSG:LOADING_FAILURE:shiftOrders');
      bindLoadingMessage(page.delayReasons, page, 'MSG:LOADING_FAILURE:delayReasons');
      bindLoadingMessage(productionState, page, 'MSG:LOADING_FAILURE:productionState');

      window.plan = plan;
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

      page.listenTo(plan, 'sync', page.onPlanSynced);
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
      var forceReloadProdState = reloadProdState;

      reloadProdState = false;

      return when(
        productionState.load(forceReloadProdState),
        this.delayReasons.fetch({reset: true}),
        plan.settings.fetch(),
        plan.shiftOrders.fetch({reset: true}),
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
      productionState.load(false);

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
            plan.shiftOrders.fetch({reset: true, reload: true}),
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
          prodLineStates: productionState.prodLineStates,
          plan: page.plan,
          mrp: mrp
        });

        page.insertView('#-mrps', mrpView).render();
      });

      this.$id('empty').toggleClass('hidden', page.plan.mrps.length > 0);
      this.$id('mrps').toggleClass('hidden', page.plan.mrps.length === 0);

      clearTimeout(this.timers.recountStats);

      this.recountStats();
    },

    reloadOrders: function()
    {
      this.promised(this.plan.lateOrders.fetch({reset: true}));
      this.promised(this.plan.sapOrders.fetch({reset: true}));
    },

    scheduleStatRecount: function()
    {
      if (this.timers.recountStats)
      {
        clearTimeout(this.timers.recountStats);
      }

      this.timers.recountStats = setTimeout(this.recountStats.bind(this), 10);
    },

    recountStats: function()
    {
      this.filterView.recountStats();
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

    onPlanSynced: function()
    {
      if (this.layout)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
        this.layout.setActions(this.actions, this);
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
