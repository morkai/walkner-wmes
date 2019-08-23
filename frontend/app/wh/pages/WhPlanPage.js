// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/time',
  'app/core/Model',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/embedded',
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
  currentUser,
  viewport,
  time,
  Model,
  View,
  bindLoadingMessage,
  embedded,
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

  var IS_EMBEDDED = window.parent !== window || window.location.pathname !== '/';

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
        },
        {
          label: t.bound('wh', 'BREADCRUMBS:pickup')
        }
      ];
    },

    actions: function()
    {
      var page = this;
      var legend = {
        label: page.t('PAGE_ACTION:legend'),
        icon: 'question-circle',
        callback: function()
        {
          page.toggleLegend(this.querySelector('.btn'));

          return false;
        }
      };

      if (IS_EMBEDDED)
      {
        return [
          {
            label: t('wh', 'PAGE_ACTION:problems'),
            icon: 'bug',
            privileges: 'WH:VIEW',
            href: '/wh-problems'
          },
          legend
        ];
      }

      return [
        {
          template: function()
          {
            return resolveActionTemplate({});
          },
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
          label: page.t('PAGE_ACTION:wh:old'),
          icon: 'truck',
          privileges: 'WH:VIEW',
          href: '#planning/wh/' + page.plan.id
        },
        {
          label: t('wh', 'PAGE_ACTION:problems'),
          icon: 'bug',
          privileges: 'WH:VIEW',
          href: '#wh/problems'
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
          privileges: ['WH:MANAGE', 'WH:MANAGE:USERS'],
          href: '#wh/settings?tab=' + (currentUser.isAllowedTo('WH:MANAGE') ? '' : 'users')
        },
        legend
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
      'socket.connected': function()
      {
        this.$el.removeClass('wh-is-disconnected');

        this.reload();
      },
      'socket.disconnected': function()
      {
        this.$el.addClass('wh-is-disconnected');
      }
    },

    events: {

      'click #-message': function()
      {
        if (document.getSelection().toString() === '')
        {
          this.hideMessage();
        }
      },
      'click #-messageOverlay': function()
      {
        this.hideMessage();
      }

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
          whStatuses: page.options.whStatuses,
          psStatuses: page.options.psStatuses,
          from: page.options.from,
          to: page.options.to
        }, {
          storageKey: 'PLANNING:DISPLAY_OPTIONS:WH'
        }),
        settings: PlanSettings.fromDate(page.options.date),
        minMaxDates: true,
        pceTimes: false
      });

      page.whSettings = bindLoadingMessage(whSettings.acquire(), page);

      page.whOrders = bindLoadingMessage(new WhOrderCollection(null, {date: plan.id}), page);

      var nlsPrefix = 'MSG:LOADING_FAILURE:';
      var nlsDomain = 'planning';

      bindLoadingMessage(plan, page, nlsPrefix + 'plan', nlsDomain);
      bindLoadingMessage(plan.settings, page, nlsPrefix + 'settings', nlsDomain);
      bindLoadingMessage(plan.sapOrders, page, nlsPrefix + 'sapOrders', nlsDomain);
      bindLoadingMessage(plan.shiftOrders, page, nlsPrefix + 'shiftOrders', nlsDomain);

      window.plan = plan;
    },

    defineViews: function()
    {
      this.filterView = new WhFilterView({
        plan: this.plan
      });

      this.listView = new WhPlanView({
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

      page.listenTo(plan.displayOptions, 'change:whStatuses', page.onWhStatusesFilterChanged);
      page.listenTo(plan.displayOptions, 'change:psStatuses', page.onPsStatusesFilterChanged);
      page.listenTo(plan.displayOptions, 'change:from change:to', page.onStartTimeFilterChanged);
      page.listenTo(plan.displayOptions, 'change:useDarkerTheme', page.onDarkerThemeChanged);

      page.listenTo(plan.sapOrders, 'sync', page.onSapOrdersSynced);

      page.listenTo(page.listView, 'setClicked', page.onSetClicked);

      $(document).on('click.' + page.idPrefix, '.paintShop-breadcrumb', page.onBreadcrumbsClick.bind(page));

      $(window)
        .on('keydown.' + page.idPrefix, page.onWindowKeyDown.bind(page))
        .on('keypress.' + page.idPrefix, page.onWindowKeyPress.bind(page));

      if (page.options.focus)
      {
        page.listenToOnce(page, 'afterRender', function()
        {
          page.timers.focus = setTimeout(page.focusOrder.bind(page, page.options.focus, true), 1);
        });
      }

      page.listenToOnce(page, 'afterRender', function()
      {
        window.parent.postMessage({type: 'ready', app: window.WMES_APP_ID}, '*');
      });
    },

    load: function(when)
    {
      var plan = this.plan;

      return when(
        this.whSettings.fetchIfEmpty(),
        this.whOrders.fetch({reset: true}),
        plan.settings.fetch(),
        plan.shiftOrders.fetch({reset: true}),
        plan.sapOrders.fetch({reset: true}),
        plan.fetch()
      );
    },

    getTemplateData: function()
    {
      return {
        darker: this.plan.displayOptions.isDarkerThemeUsed()
      };
    },

    afterRender: function()
    {
      whSettings.acquire();
      embedded.render(this);
      this.updateUrl();
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

      if (IS_EMBEDDED)
      {
        sessionStorage.WMES_WH_PICKUP_DATE = plan.id;
      }
      else
      {
        this.broker.publish('router.navigate', {
          url: '/wh/plans/' + plan.id
            + '?from=' + encodeURIComponent(plan.displayOptions.get('from'))
            + '&to=' + encodeURIComponent(plan.displayOptions.get('to'))
            + '&whStatuses=' + plan.displayOptions.get('whStatuses')
            + '&psStatuses=' + plan.displayOptions.get('psStatuses'),
          replace: true,
          trigger: false
        });
      }
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

    onWindowKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.hideMessage();
      }
    },

    onWindowKeyPress: function(e)
    {
      var tag = e.target.tagName;

      if (e.keyCode >= 48 && e.keyCode <= 57 && tag !== 'INPUT' && tag !== 'TEXTAREA')
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

    resolveAction: function(personnelId)
    {
      var page = this;

      if (page.acting)
      {
        return;
      }

      page.acting = true;

      page.showMessage('info', 0, 'resolvingAction', {personnelId: personnelId});

      var req = page.promised(page.whOrders.act('resolveAction', {personnelId: personnelId}));

      req.fail(function()
      {
        var code = req.responseJSON && req.responseJSON.error && req.responseJSON.error.code;
        var error = code;

        if (!req.status)
        {
          error = 'connectionFailure';
        }
        else if (t.has('wh', 'msg:resolveAction:' + req.status))
        {
          error = 'resolveAction:' + req.status;
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
        this.focusOrder(orders[0].id, false);
      }

      var currentDialog = viewport.currentDialog;

      if (currentDialog && user
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

    focusOrder: function(id, smooth)
    {
      var el = this.$('tr[data-id="' + id + '"]')[0];

      if (!el || el.classList.contains('hidden'))
      {
        return;
      }

      var y = el.getBoundingClientRect().top - this.listView.$('thead').outerHeight();

      if (smooth)
      {
        $('html, body').stop(true, false).animate({scrollTop: y});
      }
      else
      {
        window.scrollTo(0, y);
      }
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

      if (!$overlay.length || $overlay[0].style.display === 'none')
      {
        return;
      }

      var $message = page.$id('message');

      $message.fadeOut(function()
      {
        $overlay.css('display', 'none');
        $message.css('display', 'none');

        if (page.timers)
        {
          page.timers.hideMessage = null;
        }
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

    onWhStatusesFilterChanged: function()
    {
      this.updateUrl();
    },

    onPsStatusesFilterChanged: function()
    {
      this.updateUrl();
    },

    onStartTimeFilterChanged: function()
    {
      this.updateUrl();
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

    onSetClicked: function(whOrderId)
    {
      var whOrder = this.whOrders.get(whOrderId);

      if (!whOrder || !whOrder.get('set'))
      {
        return;
      }

      var func = _.find(whOrder.get('funcs'), function(f)
      {
        return f.user && f.user.id === currentUser.data._id;
      });
      var user = !func ? null : {
        _id: currentUser.data._id,
        label: currentUser.getLabel(),
        func: func._id
      };

      this.continueSet(user, whOrder.get('set'), false);
    }

  });
});
