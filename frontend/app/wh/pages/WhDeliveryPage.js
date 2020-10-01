// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/user',
  'app/time',
  'app/core/Model',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/embedded',
  'app/planning/util/shift',
  'app/wh-lines/WhLineCollection',
  'app/wh-setCarts/WhSetCart',
  'app/wh-setCarts/WhSetCartCollection',
  'app/wh/settings',
  'app/wh/WhOrderCollection',
  'app/wh/PlanStatsCollection',
  'app/wh/views/DeliverySectionView',
  'app/wh/views/DeliverySetView',
  'app/wh/views/ForceLineDeliveryView',
  'app/wh/templates/messages',
  'app/wh/templates/delivery/page'
], function(
  _,
  $,
  viewport,
  user,
  time,
  Model,
  View,
  bindLoadingMessage,
  embedded,
  shiftUtil,
  WhLineCollection,
  WhSetCart,
  WhSetCartCollection,
  whSettings,
  WhOrderCollection,
  PlanStatsCollection,
  DeliverySectionView,
  DeliverySetView,
  ForceLineDeliveryView,
  messageTemplates,
  pageTemplate
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

  var LINE_UPDATE_INTERVAL = 10000;

  return View.extend({

    template: pageTemplate,

    nlsDomain: 'wh',

    pageId: 'wh-delivery',

    title: function()
    {
      return [
        this.t('BREADCRUMB:base'),
        this.t('BREADCRUMB:delivery:' + this.options.kind)
      ];
    },

    breadcrumbs: [],

    remoteTopics: {
      'old.wh.lines.updated': 'onLinesUpdated',
      'old.wh.setCarts.updated': 'onSetCartsUpdated',
      'planning.stats.updated': 'onPlanStatsUpdated'
    },

    localTopics: {
      'socket.connected': function()
      {
        this.scheduleLineReload();
        this.reload();
      },
      'socket.disconnected': function()
      {
        clearTimeout(this.timers.lineReload);
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
      this.lastLineUpdateAt = 0;
      this.updatedLines = {};

      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);
      $(window).off('.' + this.idPrefix);

      document.body.style.overflow = '';
    },

    defineModels: function()
    {
      this.model = new Model({
        loading: true,
        personnelId: user.data.cardUid || ''
      });

      this.whSettings = whSettings.bind(this);

      this.planStats = bindLoadingMessage(new PlanStatsCollection(), this);

      this.lines = bindLoadingMessage(new WhLineCollection(null, {
        rqlQuery: 'limit(0)',
        paginate: false
      }), this);

      this.setCarts = bindLoadingMessage(new WhSetCartCollection(null, {
        rqlQuery: 'limit(0)&status=in=(completing,completed,delivering)&kind=' + this.options.kind,
        paginate: false
      }), this);

      this.setCarts.completed = new WhSetCartCollection(null, {paginate: false});
      this.setCarts.pending = new WhSetCartCollection(null, {paginate: false});
      this.setCarts.delivering = new WhSetCartCollection(null, {paginate: false});
    },

    defineViews: function()
    {
      this.completedView = new DeliverySectionView({
        model: this.model,
        whSettings: this.whSettings,
        lines: this.lines,
        setCarts: this.setCarts.completed,
        status: 'completed',
        kind: this.options.kind
      });

      this.pendingView = new DeliverySectionView({
        model: this.model,
        whSettings: this.whSettings,
        lines: this.lines,
        setCarts: this.setCarts.pending,
        status: 'pending'
      });

      this.deliveringView = new DeliverySectionView({
        model: this.model,
        whSettings: this.whSettings,
        lines: this.lines,
        setCarts: this.setCarts.delivering,
        status: 'delivering',
        actions: true
      });

      this.setView('#-completed', this.completedView);
      this.setView('#-pending', this.pendingView);
      this.setView('#-delivering', this.deliveringView);
    },

    defineBindings: function()
    {
      var page = this;

      page.listenTo(page.deliveringView, 'forceLineClicked', page.showForceLineDialog);

      page.once('afterRender', function()
      {
        page.listenTo(page.model, 'resolveAction', page.resolveAction);
        page.listenTo(page.model, 'continueDelivery', page.handleContinueDelivery);
        page.listenTo(page.model, 'change:loading', page.onLoadingChanged);
        page.listenTo(page.lines, 'remove add change', page.onLineUpdated);
        page.listenTo(page.setCarts, 'remove', page.onSetCartRemoved);
        page.listenTo(page.setCarts, 'add', page.onSetCartAdded);
        page.listenTo(page.setCarts, 'change', page.onSetCartChanged);
        page.listenTo(page.whSettings, 'change', page.onSettingChanged);
        page.listenTo(page.planStats, 'change', page.onPlanStatsChanged);

        page.model.set('loading', false);

        window.parent.postMessage({type: 'ready', app: window.WMES_APP_ID}, '*');

        clearTimeout(page.timers.scheduleLineUpdate);
        page.timers.scheduleLineUpdate = setTimeout(
          page.scheduleLineUpdate.bind(page, null, false),
          LINE_UPDATE_INTERVAL * 2
        );
      });

      $(window)
        .on('keydown.' + page.idPrefix, page.onWindowKeyDown.bind(page))
        .on('keypress.' + page.idPrefix, page.onWindowKeyPress.bind(page))
        .on('resize.' + page.idPrefix, page.onWindowResize.bind(page));
    },

    load: function(when)
    {
      return when(
        this.planStats.fetch({reset: true}),
        this.lines.fetch({reset: true}),
        this.setCarts.fetch({reset: true})
      );
    },

    reload: function()
    {
      var page = this;

      clearTimeout(page.timers.reload);

      page.model.set('loading', true);

      var req = page.promised($.when(
        page.whSettings.fetch({reset: true}),
        page.planStats.fetch({reset: true}),
        page.lines.fetch({reset: true}),
        page.setCarts.fetch({reset: true})
      ));

      req.done(function()
      {
        page.model.set('loading', false);
      });

      req.fail(function()
      {
        page.timers.reload = setTimeout(page.reload.bind(page), 10000);
      });
    },

    beforeRender: function()
    {
      document.body.style.overflow = 'hidden';

      clearTimeout(this.timers.handleUpdatedLines);
      this.timers.handleUpdatedLines = null;
      this.lastLineUpdateAt = 0;
      this.updatedLines = {};
    },

    afterRender: function()
    {
      this.resize();
      embedded.render(this);
    },

    onLinesUpdated: function(message)
    {
      if (!this.model.get('loading'))
      {
        this.promised(this.lines.handleUpdate(message));
      }
    },

    onLineUpdated: function(line)
    {
      this.scheduleLineUpdate(line.id, false);
    },

    scheduleLineUpdate: function(lineId, force)
    {
      this.updatedLines[lineId] = true;

      var now = Date.now();
      var delay = now - this.lastLineUpdateAt;

      if (force)
      {
        delay = 1;

        clearTimeout(this.timers.handleUpdatedLines);
        this.timers.handleUpdatedLines = null;
      }
      else if (delay > LINE_UPDATE_INTERVAL)
      {
        delay = 666;

        clearTimeout(this.timers.handleUpdatedLines);
        this.timers.handleUpdatedLines = null;
      }

      if (!this.timers.handleUpdatedLines)
      {
        this.timers.handleUpdatedLines = setTimeout(
          this.handleUpdatedLines.bind(this),
          delay
        );
      }
    },

    onSetCartsUpdated: function(message)
    {
      var page = this;

      if (page.model.get('loading'))
      {
        return;
      }

      var partials = [];

      (message.deleted || []).forEach(function(setCart)
      {
        page.setCarts.remove(setCart._id);
      });

      (message.added || []).forEach(function(setCart)
      {
        if (setCart.kind !== page.options.kind)
        {
          return;
        }

        if (setCart.status !== 'delivered')
        {
          page.setCarts.add(WhSetCart.parse(setCart));
        }
      });

      (message.updated || []).forEach(function(update)
      {
        if (update.status && update.status === 'delivered')
        {
          page.setCarts.remove(update._id);

          return;
        }

        var setCart = page.setCarts.get(update._id);

        if (setCart)
        {
          setCart.set(WhSetCart.parse(update));

          return;
        }

        if (WhSetCart.isPartial(update))
        {
          if (update.status && (!update.kind || update.kind === page.options.kind))
          {
            partials.push(update._id);
          }
        }
        else if (update.kind === page.options.kind)
        {
          page.setCarts.add(WhSetCart.parse(update));
        }
      });

      if (partials.length)
      {
        page.loadPartialSetCarts(partials);
      }
    },

    onPlanStatsUpdated: function(message)
    {
      this.planStats.update(message.plan, message.stats);
    },

    onPlanStatsChanged: function()
    {
      this.scheduleLineUpdate(null, false);
    },

    onLoadingChanged: function()
    {
      if (!this.model.get('loading'))
      {
        this.reset();
      }
    },

    onSettingChanged: function()
    {
      this.scheduleLineUpdate(null, false);
    },

    utcNow: function()
    {
      return time.getMoment().utc(true).valueOf();
    },

    reset: function()
    {
      var page = this;
      var completed = [];
      var pending = [];
      var delivering = [];
      var utcNow = page.utcNow();

      page.setCarts.forEach(function(setCart)
      {
        if (setCart.get('status') === 'delivering')
        {
          delivering.push(setCart);
        }
        else if (page.isPendingSetCart(setCart, utcNow))
        {
          pending.push(setCart);
        }
        else
        {
          completed.push(setCart);
        }
      });

      page.setCarts.completed.reset(completed);
      page.setCarts.pending.reset(pending);
      page.setCarts.delivering.reset(delivering);
    },

    onSetCartRemoved: function(setCart)
    {
      this.setCarts.completed.remove(setCart.id);
      this.setCarts.pending.remove(setCart.id);
      this.setCarts.delivering.remove(setCart.id);
    },

    onSetCartAdded: function(setCart)
    {
      if (setCart.get('status') === 'delivering')
      {
        this.setCarts.delivering.add(setCart);
      }
      else if (this.isPendingSetCart(setCart))
      {
        this.setCarts.pending.add(setCart);
      }
      else
      {
        this.setCarts.completed.add(setCart);
      }
    },

    onSetCartChanged: function(setCart)
    {
      var setCarts = this.setCarts;
      var status = setCart.get('status');

      if (status === 'completing' || status === 'completed')
      {
        setCarts.delivering.remove(setCart.id);

        if (this.isPendingSetCart(setCart))
        {
          setCarts.completed.remove(setCart.id);
          setCarts.pending.add(setCart);
        }
        else
        {
          setCarts.pending.remove(setCart.id);
          setCarts.completed.add(setCart);
        }
      }
      else
      {
        setCarts.completed.remove(setCart.id);
        setCarts.pending.remove(setCart.id);
        setCarts.delivering.add(setCart);
      }
    },

    isPendingSetCart: function(setCart, utcNow)
    {
      var page = this;

      if (setCart.get('status') === 'completing')
      {
        return false;
      }

      if (setCart.get('pending') && !setCart.get('deliveringAt'))
      {
        return true;
      }

      if (!utcNow)
      {
        utcNow = this.utcNow();
      }

      var minTimeForDelivery = page.whSettings.getMinTimeForDelivery();
      var maxDeliveryStartTime = page.whSettings.getMaxDeliveryStartTime();
      var startTime = new Date(setCart.get('startTime'));
      var startTimeDiff = startTime.getTime() - utcNow;
      var timeForDelivery = startTimeDiff < maxDeliveryStartTime;
      var minStartTimeHour = 6;
      var maxStartTimeHour = minStartTimeHour + maxDeliveryStartTime / 60000 / 60;

      return setCart.get('lines').some(function(lineId)
      {
        var whLine = page.lines.get(lineId);

        if (!whLine)
        {
          return false;
        }

        if (whLine.get('available').time >= minTimeForDelivery)
        {
          return false;
        }

        if (timeForDelivery || whLine.get('working'))
        {
          return true;
        }

        var startTimeHour = startTime.getUTCHours();

        if (startTimeHour < minStartTimeHour || startTimeHour >= maxStartTimeHour)
        {
          return false;
        }

        var firstWorkingPlan = page.planStats.getFirstWorkingPlanBefore(startTime);

        if (!firstWorkingPlan)
        {
          return false;
        }

        var endOfWork = time.utc.getMoment(firstWorkingPlan.get('date').valueOf());
        var workingShifts = firstWorkingPlan.get('workingShifts');

        for (var shiftNo = 3; shiftNo > 0; --shiftNo)
        {
          if (workingShifts[shiftNo])
          {
            endOfWork.hours(shiftUtil.getStartHourFromShiftNo(shiftNo));

            break;
          }
        }

        endOfWork.add(shiftUtil.SHIFT_DURATION - maxDeliveryStartTime, 'ms');

        return utcNow >= endOfWork.valueOf();
      });
    },

    loadPartialSetCarts: function(ids)
    {
      var page = this;
      var req = page.ajax({
        url: page.setCarts.url + '?_id=in=(' + ids.join(',') + ')&kind=' + page.options.kind
      });

      req.fail(function()
      {
        console.error('Failed to load partial set carts:', req);

        window.location.reload();
      });

      req.done(function(res)
      {
        if (res.collection)
        {
          page.onSetCartsUpdated({updated: res.collection});
        }
      });
    },

    handleUpdatedLines: function()
    {
      var page = this;
      var setCarts = page.setCarts;

      clearTimeout(page.timers.handleUpdatedLines);
      page.timers.handleUpdatedLines = null;
      page.updatedLines = {};
      page.lastLineUpdateAt = Date.now();

      var pending = {add: [], remove: []};
      var completed = {add: [], remove: []};
      var utcNow = page.utcNow();

      setCarts.completed.forEach(function(setCart)
      {
        if (page.isPendingSetCart(setCart, utcNow))
        {
          completed.remove.push(setCart);
          pending.add.push(setCart);
        }
      });

      setCarts.pending.forEach(function(setCart)
      {
        if (!page.isPendingSetCart(setCart, utcNow))
        {
          pending.remove.push(setCart);
          completed.add.push(setCart);
        }
      });

      setCarts.completed.remove(completed.remove);
      setCarts.pending.remove(pending.remove);
      setCarts.completed.add(completed.add);
      setCarts.pending.add(pending.add);

      page.completedView.highlight();
      page.pendingView.highlight();

      clearTimeout(page.timers.scheduleLineUpdate);
      page.timers.scheduleLineUpdate = setTimeout(
        page.scheduleLineUpdate.bind(page, null, false),
        LINE_UPDATE_INTERVAL * 2
      );
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

    onWindowResize: function()
    {
      this.resize();
    },

    resize: function()
    {
      var $pageHd = $('.hd');
      var $pageFt = $('.ft');
      var $sectionHd = this.$('.wh-delivery-section-hd').first();
      var $sectionFt = this.$('.wh-delivery-section-ft').first();

      var height = window.innerHeight - 30;

      if ($pageHd.length && !$pageHd.hasClass('hidden'))
      {
        height -= $pageHd.outerHeight();
      }

      if ($pageFt.length && !$pageFt.hasClass('hidden'))
      {
        height -= $pageFt.outerHeight() + 15;
      }

      height -= $sectionHd.outerHeight(true) + $sectionFt.outerHeight(true);

      this.$('.wh-delivery-section-bd').css('height', height + 'px');
    },

    handleKeyBuffer: function()
    {
      if (this.keyBuffer.length >= 6)
      {
        this.resolveAction(this.keyBuffer);
      }

      this.keyBuffer = '';
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

      var dialog = viewport.currentDialog;

      if (dialog instanceof DeliverySetView
        && dialog.model.personnelId === personnelId)
      {
        dialog.finish();

        return;
      }

      if (dialog instanceof ForceLineDeliveryView)
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

      page.showMessage('info', 0, 'resolvingAction', {personnelId: personnelId});

      var req = page.promised(
        WhOrderCollection.act(
          null,
          'resolveAction',
          Object.assign({
            source: 'delivery',
            kind: page.options.kind,
            personnelId: personnelId
          }, data)
        )
      );

      req.fail(function()
      {
        page.showErrorMessage(req, personnelId);
      });

      req.done(function(res)
      {
        page.hideMessage();
        page.handleActionResult(res);
      });

      req.always(function()
      {
        page.acting = false;

        page.model.set('personnelId', personnelId);
      });
    },

    showErrorMessage: function(jqXhr, personnelId)
    {
      var error = jqXhr.responseJSON && jqXhr.responseJSON.error || {};
      var msg = error.code;

      if (typeof msg === 'number')
      {
        msg = null;
        error.code = null;
      }

      if (!jqXhr.status)
      {
        msg = 'connectionFailure';
      }
      else if (this.t.has('msg:resolveAction:' + jqXhr.status))
      {
        msg = 'resolveAction:' + jqXhr.status;
      }
      else if (!this.t.has('msg:' + msg))
      {
        msg = 'genericFailure';
      }

      this.showMessage('error', 5000, 'text', {
        text: this.t('msg:' + msg, {
          errorCode: error.code || error.message || '?',
          personnelId: personnelId
        })
      });
    },

    handleActionResult: function(res)
    {
      switch (res.result)
      {
        case 'deliveryStarted':
          this.handleDeliveryStarted(res);
          break;

        case 'continueDelivery':
          this.handleContinueDelivery(res);
          break;

        case 'nothingToDeliver':
          this.showMessage('warning', 2500, 'text', {
            text: this.t('msg:nothingToDeliver')
          });
          break;

        default:
          console.warn('Unknown action result: %s', res.result, res);
          break;
      }
    },

    handleContinueDelivery: function(res)
    {
      var view = this;
      var setCarts = new WhSetCartCollection();

      res.setCarts.forEach(function(id)
      {
        var setCart = view.setCarts.get(id);

        if (setCart)
        {
          setCarts.add(setCart);
        }
      });

      view.showSetDialog(setCarts, res.user, res.personnelId);
    },

    handleDeliveryStarted: function(res)
    {
      var setCarts = new WhSetCartCollection(res.setCarts);

      this.showSetDialog(setCarts, res.user, res.personnelId, res.completedSapOrders);
    },

    showSetDialog: function(setCarts, user, personnelId, completedSapOrders)
    {
      if (!setCarts.length)
      {
        console.warn('Showing set dialog with no carts?!?!');

        return;
      }

      var dialogView = new DeliverySetView({
        model: {
          pendingSetCarts: this.setCarts.pending,
          setCarts: setCarts,
          personnelId: personnelId,
          completedSapOrders: completedSapOrders || []
        }
      });

      this.listenTo(dialogView, 'failure', function(jqXhr)
      {
        this.showErrorMessage(jqXhr, personnelId);
      });

      this.listenTo(dialogView, 'success', function()
      {
        this.showMessage('success', 2500, 'text', {
          text: this.t('msg:delivered')
        });
      });

      var title = this.t('delivery:set:title', {kind: setCarts.at(0).get('kind')});

      if (user)
      {
        title += ' <span class="wh-set-user">'
          + '<i class="fa fa-user"></i><span>' + _.escape(user.label) + '</span>'
          + '</span>';
      }

      viewport.closeAllDialogs();
      viewport.showDialog(dialogView, title);
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
      var html = message;

      if (messageTemplates[message])
      {
        html = this.renderPartialHtml(messageTemplates[message], messageData || {});
      }

      $message.stop(true, true);
      $overlay.css('display', 'block');
      $message
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

    scheduleLineReload: function()
    {
      var page = this;

      clearTimeout(page.timers.lineReload);

      page.timers.lineReload = setTimeout(
        function() { page.promised(page.lines.fetch()); },
        20000
      );
    },

    showForceLineDialog: function()
    {
      var page = this;
      var dialogView = new ForceLineDeliveryView({
        model: page.model,
        setCarts: page.setCarts
      });

      page.listenTo(dialogView, 'picked', function(data)
      {
        viewport.closeAllDialogs();

        page.broker.subscribe('viewport.dialog.hidden').setLimit(1).on('message', function()
        {
          page.resolveAction(data.card, {forceLine: data.line});
        });
      });

      viewport.showDialog(dialogView, page.t('delivery:forceLine:title'));
    }

  });
});
