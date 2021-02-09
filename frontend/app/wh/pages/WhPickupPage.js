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
  'app/core/util/pageActions',
  'app/paintShop/views/PaintShopDatePickerView',
  'app/planning/Plan',
  'app/planning/PlanSettings',
  'app/planning/PlanDisplayOptions',
  'app/production/views/VkbView',
  'app/wh-lines/WhLineCollection',
  '../settings',
  '../WhOrderCollection',
  '../WhPickupStatus',
  '../views/WhPickupFilterView',
  '../views/WhPickupListView',
  '../views/WhPickupSetView',
  '../views/WhPickupStatusView',
  '../views/DowntimePickerView',
  '../views/BlockedPickupView',
  '../views/ForceLinePickupView',
  '../views/ExportOrdersDialogView',
  '../templates/messages',
  'app/wh/templates/pickup/page',
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
  pageActions,
  PaintShopDatePickerView,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  VkbView,
  WhLineCollection,
  whSettings,
  WhOrderCollection,
  WhPickupStatus,
  WhPickupFilterView,
  WhPickupListView,
  WhPickupSetView,
  WhPickupStatusView,
  DowntimePickerView,
  BlockedPickupView,
  ForceLinePickupView,
  ExportOrdersDialogView,
  messageTemplates,
  pageTemplate,
  resolveActionTemplate,
  legendTemplate
) {
  'use strict';

  var DEV_PERSONNEL = {
    fmx: '13370011',
    fmx2: '13370012',
    kit: '13370021',
    kit2: '13370022',
    plat: '13370031',
    plat2: '13370032',
    pack: '13370041',
    pack2: '13370042',
    dfifo: '13370051',
    dfifo2: '13370052',
    dpack: '13370061',
    dpack2: '13370062',
    ps: '13370071',
    ps2: '13370072'
  };

  return View.extend({

    template: pageTemplate,

    modelProperty: 'whOrders',

    layoutName: 'page',

    breadcrumbs: function()
    {
      var datePicker = {
        href: '#wh/pickup/' + this.plan.id,
        label: this.plan.getLabel(),
        template: function(breadcrumb)
        {
          return '<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a>'
            + '<a href="' + breadcrumb.href + '" data-action="showPicker">' + breadcrumb.label + '</a>'
            + '<a class="fa fa-chevron-right" data-action="next"></a></span>';
        }
      };

      if (embedded.isEnabled())
      {
        return [
          this.t('BREADCRUMB:pickup'),
          datePicker
        ];
      }

      return [
        this.t('BREADCRUMB:base'),
        datePicker,
        this.t('BREADCRUMB:pickup')
      ];
    },

    actions: function()
    {
      var page = this;
      var forceLine = {
        label: page.t('pickup:forceLine:action'),
        icon: 'crosshairs',
        privileges: ['WH:MANAGE'],
        callback: function()
        {
          page.showForceLineDialog();

          return false;
        }
      };
      var legend = {
        label: page.t('PAGE_ACTION:legend'),
        icon: 'question-circle',
        callback: function()
        {
          page.toggleLegend(this.querySelector('.btn'));

          return false;
        }
      };

      if (embedded.isEnabled())
      {
        return [forceLine, legend];
      }

      return [
        {
          template: function()
          {
            return page.renderPartialHtml(resolveActionTemplate, {
              pattern: window.ENV !== 'production' ? '' : '^[0-9]{5,}$',
              value: page.lastPersonnelId || currentUser.data.cardUid
            });
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
        forceLine,
        {
          label: page.t('core', 'PAGE_ACTION:export'),
          icon: 'download',
          callback: function()
          {
            viewport.showDialog(
              new ExportOrdersDialogView({
                plan: page.plan,
                whOrders: page.whOrders
              }),
              page.t('exportOrders:title')
            );
          }
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
      'orders.synced': function()
      {
        this.promised(this.plan.sapOrders.fetch());
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
      'old.wh.orders.changed.*': function(message)
      {
        if (this.plan.getMoment().isSame(message.date))
        {
          this.promised(this.whOrders.fetch({reset: true}));
        }
      },
      'old.wh.orders.updated': function(message)
      {
        this.whOrders.update(message.updated || []);
      },
      'old.wh.lines.updated': function(message)
      {
        this.promised(this.whLines.handleUpdate(message));
      },
      'old.wh.pickupStatus.updated': function(pickupStatus)
      {
        this.pickupStatus.update(pickupStatus);
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
      this.setToContinue = null;

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
          distStatuses: page.options.distStatuses,
          from: page.options.from,
          to: page.options.to,
          orders: page.options.orders,
          lines: page.options.lines,
          mrps: page.options.mrps,
          sets: page.options.sets
        }, {
          storageKey: 'PLANNING:DISPLAY_OPTIONS:WH2'
        }),
        settings: PlanSettings.fromDate(page.options.date),
        minMaxDates: true
      });

      page.whSettings = bindLoadingMessage(whSettings.acquire(), page);

      page.whOrders = bindLoadingMessage(new WhOrderCollection(null, {date: plan.id}), page);

      page.whLines = plan.whLines = bindLoadingMessage(new WhLineCollection(), page);

      page.pickupStatus = bindLoadingMessage(new WhPickupStatus(), page);

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
      this.vkbView = embedded.isEnabled() ? new VkbView() : null;

      this.filterView = new WhPickupFilterView({
        plan: this.plan
      });

      this.listView = new WhPickupListView({
        whSettings: this.whSettings,
        whLines: this.whLines,
        whOrders: this.whOrders,
        plan: this.plan
      });

      this.statusView = new WhPickupStatusView({
        model: this.pickupStatus,
        whSettings: this.whSettings,
        whOrders: this.whOrders,
        whLines: this.whLines
      });

      if (embedded.isEnabled())
      {
        this.setView('#-vkb', this.vkbView);
      }

      this.setView('#-filter', this.filterView);
      this.setView('#-list', this.listView);
      this.setView('#-status', this.statusView);
    },

    defineBindings: function()
    {
      var page = this;
      var plan = page.plan;

      page.scheduleUpdateUrl = _.debounce(page.updateUrl.bind(page), 1);

      page.listenTo(plan, 'sync', page.onPlanSynced);
      page.listenTo(plan, 'change:_id', page.onDateFilterChanged);
      page.listenTo(plan, 'change:loading', page.onLoadingChanged);

      page.listenTo(plan.displayOptions, 'change:whStatuses', page.onWhStatusesFilterChanged);
      page.listenTo(plan.displayOptions, 'change:psStatuses', page.onPsStatusesFilterChanged);
      page.listenTo(plan.displayOptions, 'change:distStatuses', page.onDistStatusesFilterChanged);
      page.listenTo(plan.displayOptions, 'change:from change:to', page.onStartTimeFilterChanged);
      page.listenTo(plan.displayOptions, 'change:useDarkerTheme', page.onDarkerThemeChanged);
      page.listenTo(plan.displayOptions, 'change:orders change:lines change:mrps change:sets', page.scheduleUpdateUrl);

      page.listenTo(plan.sapOrders, 'sync', page.onSapOrdersSynced);

      page.listenTo(page.listView, 'setClicked', page.onSetClicked);

      $(document).on('click.' + page.idPrefix, '.paintShop-breadcrumb', page.onBreadcrumbsClick.bind(page));

      $(window)
        .on('keydown.' + page.idPrefix, page.onWindowKeyDown.bind(page))
        .on('keypress.' + page.idPrefix, page.onWindowKeyPress.bind(page));

      var focus = page.options.focus;

      if (focus)
      {
        page.listenToOnce(page, 'afterRender', function()
        {
          var fn = focus.type === 'set' ? 'focusSet' : 'focusOrder';

          page.timers.focus = setTimeout(page[fn].bind(page, focus.order, true), 1);
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
        this.whLines.fetch({reset: true}),
        this.whOrders.fetch({reset: true}),
        this.pickupStatus.fetch(),
        plan.settings.fetch(),
        plan.shiftOrders.fetch({reset: true}),
        plan.sapOrders.fetch({reset: true}),
        plan.fetch()
      );
    },

    reload: function()
    {
      var page = this;
      var plan = page.plan;

      plan.set('loading', true);

      page.whOrders.setDateFilter(plan.id);
      plan.settings.set('_id', plan.id);

      page.promised(plan.settings.fetch()).then(
        function()
        {
          var promise = $.when(
            page.whSettings.fetch({reset: true}),
            page.whLines.fetch(),
            page.whOrders.fetch({reset: true, reload: true}),
            page.pickupStatus.fetch(),
            plan.shiftOrders.fetch({reset: true, reload: true}),
            plan.sapOrders.fetch({reset: true, reload: true}),
            plan.fetch()
          );

          page.promised(promise).then(loaded, loadingFailed);
        },
        loadingFailed
      );

      function loaded()
      {
        plan.set('loading', false);
      }

      function loadingFailed()
      {
        plan.set('loading', false);

        viewport.msg.loadingFailed();
      }
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

    updateUrl: function()
    {
      var plan = this.plan;

      if (embedded.isEnabled() || window.location.pathname.startsWith('/wh-pickup'))
      {
        sessionStorage.WMES_WH_PICKUP_DATE = plan.id;
      }
      else
      {
        var params = [];

        [
          'from',
          'to',
          'whStatuses',
          'psStatuses',
          'distStatuses',
          'orders',
          'lines',
          'mrps',
          'sets'
        ].forEach(function(prop)
        {
          var value = plan.displayOptions.get(prop);

          if (!value || !value.length)
          {
            return;
          }

          if (Array.isArray(value))
          {
            params.push(prop + '=' + value.map(encodeURIComponent).join(','));
          }
          else if (typeof value === 'string' && value !== '06:00')
          {
            params.push(prop + '=' + encodeURIComponent(value));
          }
        });

        this.broker.publish('router.navigate', {
          url: '/wh/pickup/' + plan.id + (params.length ? '?' : '') + params.join('&'),
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

      this.timers.handleKeyBuffer = setTimeout(
        this.handleKeyBuffer.bind(this),
        this.keyBuffer.length > 3 ? 200 : 500
      );
    },

    handleKeyBuffer: function()
    {
      var page = this;

      if (page.keyBuffer.length >= 6)
      {
        page.resolveAction(page.keyBuffer);
      }
      else if (page.keyBuffer.length <= 3)
      {
        var set = +page.keyBuffer;
        var whOrder = page.whOrders.find(function(whOrder) { return whOrder.get('set') === set; });

        if (whOrder)
        {
          page.focusSet(whOrder.id, true);
        }
      }

      page.keyBuffer = '';
    },

    resolveAction: function(personnelId, data)
    {
      var page = this;

      if (page.acting)
      {
        return;
      }

      if (window.ENV !== 'production' && DEV_PERSONNEL[personnelId])
      {
        personnelId = DEV_PERSONNEL[personnelId];
      }

      page.lastPersonnelId = personnelId;

      var dialog = viewport.currentDialog;

      if (dialog instanceof ForceLinePickupView)
      {
        if (dialog.getCard() === personnelId)
        {
          dialog.$id('submit').click();
        }
        else
        {
          dialog.setCard(personnelId);
        }

        return;
      }

      viewport.closeAllDialogs();

      page.acting = true;

      page.showMessage('info', 0, 'resolvingAction', {
        personnelId: personnelId,
        hideOnClick: false
      });

      var req = page.promised(
        page.whOrders.act(
          'resolveAction',
          Object.assign({source: 'pickup', personnelId: personnelId}, data)
        )
      );

      req.fail(function()
      {
        var error = req.responseJSON && req.responseJSON.error || {};
        var msg = error.code;

        if (typeof msg === 'number')
        {
          msg = null;
          error.code = null;
        }

        if (!req.status)
        {
          msg = 'connectionFailure';
        }
        else if (page.t.has('msg:resolveAction:' + req.status))
        {
          msg = 'resolveAction:' + req.status;
        }
        else if (!page.t.has('msg:' + msg))
        {
          msg = 'genericFailure';
        }

        page.showMessage('error', 5000, 'text', {
          text: page.t('msg:' + msg, {
            errorCode: error.code || error.message || '?',
            personnelId: personnelId
          })
        });
      });

      req.done(function(res)
      {
        page.hideMessage(false, true);
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
          this.continueSet(res.user, res.orders[0].date, res.orders[0].set);
          break;

        case 'assignedToSet':
          this.whOrders.update(res.orders);
          this.continueSet(res.user, res.orders[0].date, res.orders[0].set);
          break;

        case 'continueSet':
          this.continueSet(res.user, res.date, res.set);
          break;

        case 'pickDowntimeReason':
          this.pickDowntimeReason(res.personnelId, res.user, res.startedAt);
          break;

        case 'ignoredLines':
          this.handleIgnoredLines(res.ignoredLines, res.unpaintedLines, res.user);
          break;

        default:
          console.warn('Unknown action result: %s', res.result, res);
          break;
      }
    },

    continueSet: function(user, date, set, scroll)
    {
      var page = this;

      if (!time.utc.getMoment(page.whOrders.getDateFilter()).isSame(date))
      {
        page.setToContinue = Array.prototype.slice.call(arguments);

        page.plan.set('_id', time.utc.format(date, 'YYYY-MM-DD'));

        return;
      }

      if (page.setToContinue)
      {
        page.hideMessage(true, true);
      }

      page.setToContinue = null;

      var orders = page.whOrders.filter(function(o) { return o.get('set') === set; });

      if (!orders.length)
      {
        return;
      }

      if (scroll !== false)
      {
        var anyOrderId = orders[0].id;
        var visibleOrder = orders.find(function(o) { return !page.listView.$row(o.id).hasClass('hidden'); });

        page.focusOrder(visibleOrder ? visibleOrder.id : anyOrderId, false);
      }

      var currentDialog = viewport.currentDialog;

      if (user
        && currentDialog
        && currentDialog instanceof WhPickupSetView
        && currentDialog.model.user
        && currentDialog.model.user._id === user._id
        && currentDialog.model.date === date
        && currentDialog.model.set === set)
      {
        return;
      }

      viewport.closeAllDialogs();

      var line = orders[0].get('line');
      var dialogView = new WhPickupSetView({
        model: {
          user: user,
          date: date,
          set: set,
          line: line
        },
        whOrders: page.whOrders,
        plan: page.plan,
        vkb: page.vkbView
      });

      if (orders[0].get('redirLine'))
      {
        var lines = orders[0].get('lines');
        var redirTitle = orders[0].get('redirLines')
          .map(function(sourceLine, i)
          {
            return _.escape(sourceLine) + ' ➜ ' + _.escape(lines[i]._id);
          })
          .join('\n');

        line = '<span title="' + redirTitle + '"><i class="fa fa-arrow-right"></i><span>'
          + _.escape(line)
          + '</span></span>';
      }

      var dialogTitle = page.t('set:title', {
        set: set,
        line: line
      });

      if (user)
      {
        dialogTitle += ' <span class="wh-set-user">'
          + '<i class="fa fa-user"></i><span>' + _.escape(user.label) + '</span>'
          + '<i class="fa fa-users"></i><span>' + page.t('func:' + user.func) + '</span>'
          + '</span>';
      }

      viewport.showDialog(dialogView, dialogTitle);
    },

    pickDowntimeReason: function(personnelId, user, startedAt)
    {
      var page = this;
      var dialogView = new DowntimePickerView({
        model: {
          user: user,
          startedAt: startedAt
        }
      });

      viewport.showDialog(dialogView, page.t('downtimePicker:title'));

      page.listenTo(dialogView, 'picked', function(result)
      {
        page.resolveAction(personnelId, result);
      });
    },

    handleIgnoredLines: function(ignoredLines, unpaintedLines, whUser)
    {
      var dialogView = new BlockedPickupView({
        model: {
          whLines: this.whLines,
          ignoredLines: ignoredLines,
          unpaintedLines: unpaintedLines,
          whUser: whUser
        }
      });

      viewport.showDialog(dialogView, this.t('blockedPickup:title'));
    },

    focusOrder: function(id, smooth)
    {
      var el = this.$('tr[data-id="' + id + '"]')[0];

      if (!el || el.classList.contains('hidden'))
      {
        return;
      }

      var y = el.getBoundingClientRect().top - this.listView.$('thead').outerHeight();

      if (smooth && !embedded.isEnabled())
      {
        $('html, body').stop(true, false).animate({scrollTop: y});
      }
      else
      {
        window.scrollTo(0, y);
      }
    },

    focusSet: function(whOrderId, scroll)
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

      this.continueSet(user, whOrder.get('date'), whOrder.get('set'), scroll === true);
    },

    showMessage: function(type, time, message, messageData)
    {
      if (this.timers.hideMessage)
      {
        clearTimeout(this.timers.hideMessage);
      }

      var isEmbedded = embedded.isEnabled();
      var $overlay = this.$id('messageOverlay');
      var $message = this.$id('message');
      var visible = $overlay[0].style.display === 'block';
      var html = message;

      messageData = Object.assign({}, {embedded: isEmbedded}, messageData);

      if (messageTemplates[message])
      {
        html = this.renderPartialHtml(messageTemplates[message], messageData);
      }

      $message.stop(true, true);
      $overlay.css('display', 'block');
      $message
        .data('hideOnClick', messageData.hideOnClick !== false)
        .html(html)
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
          display: isEmbedded ? 'block' : 'none',
          marginTop: ($message.outerHeight() / 2 * -1) + 'px',
          marginLeft: ($message.outerWidth() / 2 * -1) + 'px'
        });

        if (!isEmbedded)
        {
          $message.fadeIn();
        }
      }

      if (time > 0)
      {
        this.timers.hideMessage = setTimeout(this.hideMessage.bind(this), time);
      }
    },

    hideMessage: function(now, force)
    {
      var page = this;

      clearTimeout(page.timers.hideMessage);

      var $overlay = page.$id('messageOverlay');

      if (!$overlay.length || $overlay[0].style.display === 'none')
      {
        return;
      }

      var $message = page.$id('message');

      if (!force && $message.data('hideOnClick') === false)
      {
        return;
      }

      if (now === true || embedded.isEnabled())
      {
        hide();
      }
      else
      {
        $message.fadeOut(hide);
      }

      function hide()
      {
        $overlay.css('display', 'none');
        $message.css('display', 'none');

        if (page.timers)
        {
          page.timers.hideMessage = null;
        }
      }
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
      var url = '/old/wh/orders?limit(1)&select(date)';

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

    onDistStatusesFilterChanged: function()
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

    onLoadingChanged: function()
    {
      if (!this.setToContinue)
      {
        return;
      }

      if (!this.plan.get('loading'))
      {
        this.continueSet.apply(this, this.setToContinue);

        return;
      }

      this.showMessage('warning', 0, 'switchingPlan', {
        newDate: this.plan.getLabel()
      });
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
      this.focusSet(whOrderId, false);
    },

    showForceLineDialog: function()
    {
      var page = this;
      var dialogView = new ForceLinePickupView({
        model: {
          personnelId: page.lastPersonnelId || currentUser.data.cardUid,
          whLines: page.whLines
        }
      });

      page.listenTo(dialogView, 'picked', function(data)
      {
        page.broker.subscribe('viewport.dialog.hidden').setLimit(1).on('message', function()
        {
          page.resolveAction(data.card, {
            forceLine: data.forceLine,
            redirLine: !!data.redirLine && data.redirLine !== data.forceLine ? data.redirLine : null,
            forceDelivery: data.forceDelivery
          });
        });

        viewport.closeAllDialogs();
      });

      viewport.showDialog(dialogView, page.t('pickup:forceLine:title'));
    },

    cancelAllOrders: function()
    {
      if (!currentUser.isAllowedTo('SUPER') || window.ENV !== 'development')
      {
        return;
      }

      const ids = new Set();

      this.whOrders.forEach(o =>
      {
        if (o.get('status') !== 'cancelled')
        {
          ids.add(o.id);
        }
      });

      ids.forEach(id =>
      {
        this.whOrders.act('resetOrders', {
          orders: [id],
          date: this.plan.id,
          cancel: true
        });
      });
    },

    resetAllSets: function(cancel)
    {
      if (!currentUser.isAllowedTo('SUPER') || window.ENV !== 'development')
      {
        return;
      }

      const sets = new Set();
      const ids = new Set();

      this.whOrders.forEach(o =>
      {
        if (o.get('set'))
        {
          sets.add(o.get('set'));
        }
        else if (o.get('status') === 'cancelled' || o.get('status') === 'problem')
        {
          ids.add(o.id);
        }
      });

      sets.forEach(set =>
      {
        this.whOrders.act('resetOrders', {
          set,
          date: this.plan.id,
          cancel: cancel === true
        });
      });

      ids.forEach(id =>
      {
        this.whOrders.act('resetOrders', {
          orders: [id],
          date: this.plan.id,
          cancel: cancel === true
        });
      });
    },

    generate: function()
    {
      if (!currentUser.isAllowedTo('SUPER') || window.ENV !== 'development')
      {
        return;
      }

      this.ajax({
        method: 'POST',
        url: '/old/wh;generate?date=' + this.plan.id
      });
    }

  });
});
