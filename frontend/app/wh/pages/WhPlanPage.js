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
  'app/factoryLayout/productionState',
  'app/paintShop/views/PaintShopDatePickerView',
  'app/planning/Plan',
  'app/planning/PlanSettings',
  'app/planning/PlanDisplayOptions',
  '../settings',
  '../WhOrderCollection',
  '../views/WhFilterView',
  '../views/WhPlanView',
  '../views/WhSetView',
  '../templates/messages',
  'app/wh/templates/planPage',
  'app/wh/templates/resolveAction',
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
  productionState,
  PaintShopDatePickerView,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  whSettings,
  WhOrderCollection,
  WhFilterView,
  WhPlanView,
  WhSetView,
  messageTemplates,
  pageTemplate,
  resolveActionTemplate,
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
          label: t.bound('wh', 'BREADCRUMBS:base')
        },
        {
          href: '#wh/plans/' + this.plan.id,
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
          template: resolveActionTemplate,
          afterRender: function($action)
          {
            $action.find('form').on('submit', function()
            {
              page.resolveAction($action.find('input[name="card"]').val());

              return false;
            });
          }
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
          privileges: 'WH:MANAGE',
          href: '#wh/settings'
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
      'paintShop.orders.updated.*': function(message)
      {
        var sapOrder = this.plan.sapOrders.get(message.order);

        if (sapOrder && message.status)
        {
          sapOrder.set('psStatus', message.status);
        }
      },
      'wh.orders.changed.*': function(message)
      {
        if (this.plan.getMoment().isSame(message.date))
        {
          this.promised(this.whOrders.fetch({reset: true}));
        }
      },
      'wh.orders.updated': function(message)
      {
        var newOrders = message.orders;

        if (newOrders.length && this.whOrders.get(newOrders[0]._id))
        {
          this.whOrders.update(newOrders);
        }
      }
    },

    localTopics: {
      'socket.disconnected': function() { reloadProdState = true; }
    },

    initialize: function()
    {
      this.keyBuffer = '';

      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);
      $(window).off('.' + this.idPrefix);

      productionState.unload();
      whSettings.release();
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
          mrps: page.options.mrps
        }, {
          storageKey: 'PLANNING:DISPLAY_OPTIONS:WH'
        }),
        settings: PlanSettings.fromDate(page.options.date),
        minMaxDates: true,
        pceTimes: false
      });

      page.whSettings = bindLoadingMessage(whSettings.acquire(), page);

      page.whOrders = bindLoadingMessage(new WhOrderCollection(null, {date: page.options.date}), page);

      var nlsPrefix = 'MSG:LOADING_FAILURE:';
      var nlsDomain = 'planning';

      bindLoadingMessage(plan, page, nlsPrefix + 'plan', nlsDomain);
      bindLoadingMessage(plan.settings, page, nlsPrefix + 'settings', nlsDomain);
      bindLoadingMessage(plan.sapOrders, page, nlsPrefix + 'sapOrders', nlsDomain);
      bindLoadingMessage(plan.shiftOrders, page, nlsPrefix + 'shiftOrders', nlsDomain);
      bindLoadingMessage(productionState, page, nlsPrefix + 'productionState', nlsDomain);

      window.plan = plan;
    },

    defineViews: function()
    {
      this.filterView = new WhFilterView({
        plan: this.plan
      });

      this.listView = new WhPlanView({
        prodLineStates: productionState.prodLineStates,
        whSettings: this.whSettings,
        whOrders: this.whOrders,
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

      page.listenTo(plan.displayOptions, 'change:useDarkerTheme', page.onDarkerThemeChanged);

      page.listenTo(plan.sapOrders, 'sync', page.onSapOrdersSynced);

      page.listenTo(page.whOrders, 'act', page.onActionRequested);

      page.listenTo(page.listView, 'setClicked', page.onSetClicked);

      $(document).on('click.' + page.idPrefix, '.paintShop-breadcrumb', page.onBreadcrumbsClick.bind(page));

      $(window).on('keypress.' + page.idPrefix, page.onWindowKeyPress.bind(page));
    },

    load: function(when)
    {
      var plan = this.plan;
      var forceReloadProdState = reloadProdState;

      reloadProdState = false;

      return when(
        productionState.load(forceReloadProdState),
        this.whSettings.fetchIfEmpty(),
        this.whOrders.fetch({reset: true}),
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
      whSettings.acquire();

      viewport.currentPage.resolveAction('1000000001');
    },

    reload: function()
    {
      var page = this;
      var plan = page.plan;

      plan.set('loading', true);

      page.whOrders.date = page.plan.id;

      page.promised(plan.settings.set('_id', plan.id).fetch()).then(
        function()
        {
          var promise = $.when(
            page.whSettings.fetch({reset: true}),
            page.whOrders.fetch({reset: true, reload: true}),
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
        url: '/wh/plans/' + plan.id,
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

    onWindowKeyPress: function(e)
    {
      if (e.keyCode >= 48 && e.keyCode <= 57)
      {
        this.keyBuffer += (e.keyCode - 48).toString();
      }

      clearTimeout(this.timers.handleKeyBuffer);

      this.timers.handleKeyBuffer = setTimeout(this.handleKeyBuffer.bind(this), 200);
    },

    handleKeyBuffer: function()
    {
      if (this.keyBuffer.length >= 6)
      {
        this.resolveAction(this.keyBuffer);
      }

      this.keyBuffer = '';
    },

    act: function(action, data)
    {
      return this.ajax({
        method: 'POST',
        url: '/wh/plans/' + this.plan.id + ';act',
        data: JSON.stringify({
          action: action,
          data: data
        })
      });
    },

    resolveAction: function(personnelId)
    {
      var page = this;

      if (page.acting)
      {
        return;
      }

      page.acting = true;

      page.showMessage('info', 0, 'resolvingAction', {personnelId: personnelId});

      var req = page.act('resolveAction', {personnelId: personnelId});

      req.fail(function()
      {
        var code = req.responseJSON && req.responseJSON.error && req.responseJSON.error.code;
        var error = code;

        if (!req.status)
        {
          error = 'connectionFailure';
        }
        else if (!t.has('wh', 'msg:' + error))
        {
          error = 'genericFailure';
        }

        page.showMessage('error', 5000, 'text', {
          text: t('wh', 'msg:' + error, {
            errorCode: code,
            personnelId: personnelId
          })
        });
      });

      req.done(function(res)
      {
        page.hideMessage();
        page.handleActionResult(res);
      });

      req.always(function()
      {
        page.acting = false;
      });
    },

    handleActionResult: function(res)
    {
      switch (res.result)
      {
        case 'newSetStarted':
          this.whOrders.update(res.orders);
          this.continueSet(res.user, res.orders[0].set);
          break;

        case 'assignedToSet':
          this.whOrders.update(res.orders);
          this.continueSet(res.user, res.orders[0].set);
          break;

        case 'continueSet':
          this.continueSet(res.user, res.set);
          break;
      }
    },

    continueSet: function(user, set, scroll)
    {
      var orders = this.whOrders.filter(function(o) { return o.get('set') === set; });

      if (!orders.length)
      {
        return;
      }

      if (scroll !== false)
      {
        this.$('tr[data-id="' + orders[0].id + '"]')[0].scrollIntoView({
          behavior: 'instant',
          block: 'start',
          inline: 'start'
        });
      }

      var currentDialog = viewport.currentDialog;

      if (currentDialog
        && currentDialog instanceof WhSetView
        && currentDialog.model.user
        && currentDialog.model.user._id === user._id
        && currentDialog.model.set === set)
      {
        return;
      }

      viewport.closeAllDialogs();

      var dialogView = new WhSetView({
        model: {
          user: user,
          set: set
        },
        whOrders: this.whOrders,
        plan: this.plan
      });

      viewport.showDialog(dialogView, t('wh', 'set:title', {
        set: set,
        line: orders[0].get('line')
      }));
    },

    showMessage: function(type, time, message, messageData)
    {
      if (this.timers.hideMessage)
      {
        clearTimeout(this.timers.hideMessage);
      }

      var $overlay = this.$id('messageOverlay');
      var $message = this.$id('message');
      var visible = $overlay[0].style.display === 'block';

      $overlay.css('display', 'block');
      $message
        .html(messageTemplates[message] && messageTemplates[message](messageData || {}) || message)
        .removeClass('message-error message-warning message-success message-info')
        .addClass('message-' + type);

      if (visible)
      {
        $message.css({
          marginTop: ($message.outerHeight() / 2 * -1) + 'px',
          marginLeft: ($message.outerWidth() / 2 * -1) + 'px'
        });
      }
      else
      {
        $message.css({
          display: 'block',
          marginLeft: '-5000px'
        });

        $message.css({
          display: 'none',
          marginTop: ($message.outerHeight() / 2 * -1) + 'px',
          marginLeft: ($message.outerWidth() / 2 * -1) + 'px'
        });

        $message.fadeIn();
      }

      if (time > 0)
      {
        this.timers.hideMessage = setTimeout(this.hideMessage.bind(this), time);
      }
    },

    hideMessage: function()
    {
      var page = this;

      clearTimeout(page.timers.hideMessage);

      var $overlay = page.$id('messageOverlay');

      if ($overlay[0].style.display === 'none')
      {
        return;
      }

      var $message = page.$id('message');

      $message.fadeOut(function()
      {
        $overlay.css('display', 'none');
        $message.css('display', 'none');

        page.timers.hideMessage = null;
      });
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
      var url = '/wh/orders?limit(1)&select(date)';

      if (dir === 'prev')
      {
        url += '&sort(-date)&date<' + date + '&date>' + (date - month);
      }
      else
      {
        url += '&sort(date)&date>' + date + '&date<' + (date + month);
      }

      var req = page.ajax({url: url});

      req.done(function(res)
      {
        if (res.totalCount)
        {
          page.plan.set('_id', time.utc.format(res.collection[0].date, 'YYYY-MM-DD'));
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

      this.plan.mrps.reset([]);
      this.plan.sapOrders.reset([]);
      this.plan.shiftOrders.reset([]);
      this.plan.orders.reset([]);
      this.plan.lines.reset([]);
      this.whOrders.reset([]);

      this.updateUrl();
      this.reload();
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

    onSapOrdersSynced: function()
    {
      if (this.timers.reloadOrders)
      {
        clearTimeout(this.timers.reloadOrders);
      }

      this.timers.reloadOrders = setTimeout(this.reloadOrders.bind(this), 10 * 60 * 1000);
    },

    onActionRequested: function(action, data)
    {
      this.act(action, data);
    },

    onSetClicked: function(whOrderId)
    {
      var whOrder = this.whOrders.get(whOrderId);

      if (whOrder && whOrder.get('set'))
      {
        this.continueSet(null, whOrder.get('set'), false);
      }
    }

  });
});
