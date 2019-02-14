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
  'app/paintShop/views/PaintShopDatePickerView',
  '../settings',
  '../Plan',
  '../PlanSettings',
  '../PlanDisplayOptions',
  '../WhOrderStatusCollection',
  '../views/WhFilterView',
  '../views/WhListView',
  'app/planning/templates/whPage',
  'app/planning/templates/planLegend'
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
  PaintShopDatePickerView,
  settings,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  WhOrderStatusCollection,
  WhFilterView,
  WhListView,
  pageTemplate,
  legendTemplate
) {
  'use strict';

  var reloadProdState = false;

  return View.extend({

    template: pageTemplate,

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('planning', 'BREADCRUMBS:wh')
        },
        {
          href: '#planning/wh/' + this.plan.id,
          label: this.plan.getLabel(),
          template: function(breadcrumb)
          {
            return '<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a>'
              + '<a href="' + breadcrumb.href + '" data-action="showPicker">' + breadcrumb.label + '</a>'
              + '<a class="fa fa-chevron-right" data-action="next"></a></span>';
          }
        }
      ];
    },

    actions: function()
    {
      var page = this;

      return [
        {
          label: page.t('PAGE_ACTION:wh:new'),
          icon: 'truck',
          privileges: 'WH:VIEW',
          href: '#wh/plans/' + page.plan.id
        },
        {
          label: page.t('PAGE_ACTION:dailyPlan'),
          icon: 'calculator',
          privileges: 'PLANNING:VIEW',
          href: '#planning/plans/' + page.plan.id
        },
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'PLANNING:MANAGE',
          href: '#planning/settings?tab=wh'
        },
        {
          label: page.t('PAGE_ACTION:legend'),
          icon: 'question-circle',
          callback: function()
          {
            page.toggleLegend(this.querySelector('.btn'));

            return false;
          }
        }
      ];
    },

    remoteTopics: {
      'planning.changes.created': function(planChange)
      {
        this.plan.applyChange(planChange);
      },
      'orders.synced': function()
      {
        this.reloadOrders();
      },
      'orders.updated.*': function(message)
      {
        var change = message.change;
        var newValues = change.newValues;

        var sapOrder = this.plan.sapOrders.get(message._id);

        if (!sapOrder)
        {
          return;
        }

        var attrs = _.clone(newValues);

        if (!_.isEmpty(change.comment))
        {
          attrs.comments = sapOrder.get('comments').concat({
            source: change.source,
            time: change.time,
            user: change.user,
            text: change.comment,
            delayReason: newValues.delayReason
          });
        }

        sapOrder.set(attrs);
      },
      'production.stateChanged.**': function(message)
      {
        this.plan.shiftOrders.update(message);
      },
      'planning.whOrderStatuses.updated': function(message)
      {
        this.whOrderStatuses.update(message);
      }
    },

    localTopics: {
      'socket.disconnected': function() { reloadProdState = true; }
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);
      $(window).off('.' + this.idPrefix);

      productionState.unload();
      settings.release();
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    defineModels: function()
    {
      var page = this;

      var plan = page.model = page.plan = new Plan({_id: page.options.date}, {
        displayOptions: PlanDisplayOptions.fromLocalStorage({
          mrps: page.options.mrps,
          lines: page.options.lines
        }, {
          storageKey: 'PLANNING:DISPLAY_OPTIONS:WH'
        }),
        settings: PlanSettings.fromDate(page.options.date),
        minMaxDates: true,
        pceTimes: false
      });

      page.delayReasons = new DelayReasonCollection();

      page.whOrderStatuses = bindLoadingMessage(new WhOrderStatusCollection(null, {date: plan.id}), page);

      var nlsPrefix = 'MSG:LOADING_FAILURE:';
      var nlsDomain = 'planning';

      bindLoadingMessage(plan, page, nlsPrefix + 'plan', nlsDomain);
      bindLoadingMessage(plan.settings, page, nlsPrefix + 'settings', nlsDomain);
      bindLoadingMessage(plan.sapOrders, page, nlsPrefix + 'sapOrders', nlsDomain);
      bindLoadingMessage(plan.shiftOrders, page, nlsPrefix + 'shiftOrders', nlsDomain);
      bindLoadingMessage(page.delayReasons, page, nlsPrefix + 'delayReasons', nlsDomain);
      bindLoadingMessage(productionState, page, nlsPrefix + 'productionState', nlsDomain);

      window.plan = plan;
    },

    defineViews: function()
    {
      this.filterView = new WhFilterView({
        plan: this.plan
      });

      this.listView = new WhListView({
        delayReasons: this.delayReasons,
        prodLineStates: productionState.prodLineStates,
        whOrderStatuses: this.whOrderStatuses,
        plan: this.plan
      });

      this.setView('#-filter', this.filterView);
      this.setView('#-list', this.listView);
    },

    defineBindings: function()
    {
      var page = this;
      var plan = page.plan;

      page.listenTo(plan, 'sync', page.onPlanSynced);
      page.listenTo(plan, 'change:_id', page.onDateFilterChanged);

      page.listenTo(plan.displayOptions, 'change:mrps', page.onMrpsFilterChanged);
      page.listenTo(plan.displayOptions, 'change:lines', page.onLinesFilterChanged);
      page.listenTo(plan.displayOptions, 'change:useDarkerTheme', page.onDarkerThemeChanged);

      page.listenTo(plan.settings, 'changed', page.onSettingsChanged);
      page.listenTo(plan.settings, 'errored', page.reload);

      page.listenTo(plan.settings.global, 'change', page.onGlobalSettingChanged);

      page.listenTo(plan.mrps, 'reset', page.onMrpsReset);

      page.listenTo(plan.sapOrders, 'sync', page.onSapOrdersSynced);

      page.listenTo(page.listView, 'statsRecounted', page.filterView.updateStats.bind(page.filterView));

      page.listenTo(page.whOrderStatuses, 'add', page.onWhOrderStatusAdded);
      page.listenTo(page.whOrderStatuses, 'change:status', page.onWhOrderStatusChanged);

      $(document)
        .on('click.' + page.idPrefix, '.paintShop-breadcrumb', this.onBreadcrumbsClick.bind(this));
    },

    load: function(when)
    {
      var plan = this.plan;
      var forceReloadProdState = reloadProdState;

      reloadProdState = false;

      return when(
        productionState.load(forceReloadProdState),
        this.delayReasons.fetch({reset: true}),
        this.whOrderStatuses.fetch({reset: true}),
        plan.settings.fetch(),
        plan.shiftOrders.fetch({reset: true}),
        plan.sapOrders.fetch({reset: true}),
        plan.fetch()
      );
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        darker: this.plan.displayOptions.isDarkerThemeUsed()
      };
    },

    afterRender: function()
    {
      productionState.load(false);
      settings.acquire();
    },

    reload: function()
    {
      var page = this;
      var plan = page.plan;

      plan.set('loading', true);

      page.whOrderStatuses.date = plan.id;

      page.promised(plan.settings.set('_id', plan.id).fetch()).then(
        function()
        {
          var promise = $.when(
            page.whOrderStatuses.fetch({reset: true}),
            plan.shiftOrders.fetch({reset: true, reload: true}),
            plan.sapOrders.fetch({reset: true, reload: true}),
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
        url: '/planning/wh/' + plan.id
          + '?mrps=' + plan.displayOptions.get('mrps')
          + '&lines=' + plan.displayOptions.get('lines'),
        replace: true,
        trigger: false
      });
    },

    reloadOrders: function()
    {
      this.promised(this.plan.sapOrders.fetch({reset: true}));
    },

    toggleLegend: function(btnEl)
    {
      if (this.$legendPopover)
      {
        this.$legendPopover.popover('destroy');
        this.$legendPopover = null;

        return;
      }

      this.$legendPopover = $(btnEl).popover({
        trigger: 'manual',
        placement: 'left',
        html: true,
        content: legendTemplate({}),
        template: '<div class="popover planning-legend-popover">'
        + '<div class="popover-content"></div>'
        + '</div>'
      });

      this.$legendPopover.one('hide.bs.popover', function()
      {
        btnEl.classList.remove('active');
      });

      this.$legendPopover.popover('show');

      btnEl.classList.add('active');
    },

    onBreadcrumbsClick: function(e)
    {
      if (e.target.tagName !== 'A')
      {
        return;
      }

      if (e.target.classList.contains('disabled'))
      {
        return false;
      }

      if (e.target.dataset.action === 'showPicker')
      {
        this.showDatePickerDialog();
      }
      else
      {
        this.selectNonEmptyDate(e.target.dataset.action);
      }

      return false;
    },

    showDatePickerDialog: function()
    {
      var dialogView = new PaintShopDatePickerView({
        model: {
          date: this.plan.id
        }
      });

      this.listenTo(dialogView, 'picked', function(newDate)
      {
        viewport.closeDialog();

        if (newDate !== this.plan.id)
        {
          this.plan.set('_id', newDate);
        }
      });

      viewport.showDialog(dialogView);
    },

    selectNonEmptyDate: function(dir)
    {
      $('.paintShop-breadcrumb').find('a').addClass('disabled');

      var page = this;
      var date = +page.plan.getMoment().valueOf();
      var month = 30 * 24 * 3600 * 1000;
      var url = '/planning/plans/?limit(1)&select(_id)&orders>()';

      if (dir === 'prev')
      {
        url += '&sort(-_id)&_id<' + date + '&_id>' + (date - month);
      }
      else
      {
        url += '&sort(_id)&_id>' + date + '&_id<' + (date + month);
      }

      var req = page.ajax({url: url});

      req.done(function(res)
      {
        if (res.totalCount)
        {
          page.plan.set('_id', time.utc.format(res.collection[0]._id, 'YYYY-MM-DD'));
        }
        else
        {
          viewport.msg.show({
            type: 'warning',
            time: 2500,
            text: t('paintShop', 'MSG:date:empty')
          });
        }
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: t('paintShop', 'MSG:date:failure')
        });
      });

      req.always(function()
      {
        if (page.layout)
        {
          page.layout.setBreadcrumbs(page.breadcrumbs, page);
        }
      });
    },

    onDateFilterChanged: function()
    {
      if (this.layout)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
        this.layout.setActions(this.actions, this);
      }

      this.updateUrl();

      this.plan.mrps.reset([]);
      this.plan.sapOrders.reset([]);
      this.plan.shiftOrders.reset([]);
      this.plan.orders.reset([]);
      this.plan.lines.reset([]);

      this.reload();
    },

    onMrpsFilterChanged: function()
    {
      this.updateUrl();
      this.plan.mrps.reset();
    },

    onLinesFilterChanged: function()
    {
      this.updateUrl();
      this.listView.scheduleRender();
    },

    onDarkerThemeChanged: function()
    {
      this.$el.toggleClass('planning-darker', this.plan.displayOptions.isDarkerThemeUsed());
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

    onGlobalSettingChanged: function(setting)
    {
      if (/ignoredMrps/.test(setting.id))
      {
        if (_.first(this.plan.displayOptions.get('mrps')) === 'wh')
        {
          this.plan.mrps.reset();
        }

        return;
      }

      if (/.wh./.test(setting.id))
      {
        this.listView.scheduleRender();
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

    onMrpsReset: function()
    {
      this.listView.scheduleRender();
    },

    onWhOrderStatusAdded: function(whOrderStatus)
    {
      this.filterView.updateStat(0, whOrderStatus.get('status'));
    },

    onWhOrderStatusChanged: function(whOrderStatus)
    {
      var prev = whOrderStatus.previous('status');

      if (typeof prev === 'number')
      {
        this.filterView.updateStat(prev, whOrderStatus.get('status'));
      }
    }

  });
});
