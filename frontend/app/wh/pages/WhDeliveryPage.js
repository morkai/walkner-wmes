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
  'app/wh-lines/WhLineCollection',
  'app/wh-setCarts/WhSetCart',
  'app/wh-setCarts/WhSetCartCollection',
  'app/wh/settings',
  'app/wh/WhOrderCollection',
  'app/wh/WhPendingComponentsCollection',
  'app/wh/WhPendingPackagingCollection',
  'app/wh/views/DeliverySectionView',
  'app/wh/views/DeliverySetView',
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
  WhLineCollection,
  WhSetCart,
  WhSetCartCollection,
  whSettings,
  WhOrderCollection,
  WhPendingComponentsCollection,
  WhPendingPackagingCollection,
  DeliverySectionView,
  DeliverySetView,
  messageTemplates,
  pageTemplate
) {
  'use strict';

  var DEV_PERSONNEL = {
    fmx: '13370011',
    fmx2: '13370012',
    kit: '13370021',
    kit2: '13370022',
    pack: '13370031',
    pack2: '13370032',
    plat: '13370041',
    plat2: '13370042',
    dfifo: '13370051',
    dfifo2: '13370052',
    dpack: '13370061',
    dpack2: '13370061'
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

    remoteTopics: function()
    {
      var topics = {
        'old.wh.lines.updated': 'onLinesUpdated',
        'old.wh.setCarts.updated': 'onSetCartsUpdated'
      };

      topics['old.wh.pending.' + this.options.kind + '.updated'] = 'onPendingDeliveriesUpdated';

      return topics;
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

      this.lines = bindLoadingMessage(new WhLineCollection(null, {
        rqlQuery: 'limit(0)',
        paginate: false
      }), this);

      var WhPendingDeliveriesCollection = this.options.kind === 'components'
        ? WhPendingComponentsCollection
        : WhPendingPackagingCollection;

      this.pendingDeliveries = bindLoadingMessage(new WhPendingDeliveriesCollection(null, {
        rqlQuery: 'limit(0)',
        paginate: false
      }), this);

      this.setCarts = bindLoadingMessage(new WhSetCartCollection(null, {
        rqlQuery: 'limit(0)&status=in=(completed,delivering)&kind=' + this.options.kind,
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
        resolveAction: true
      });

      this.setView('#-completed', this.completedView);
      this.setView('#-pending', this.pendingView);
      this.setView('#-delivering', this.deliveringView);
    },

    defineBindings: function()
    {
      var page = this;

      page.once('afterRender', function()
      {
        page.listenTo(page.model, 'resolveAction', page.resolveAction);
        page.listenTo(page.model, 'continueDelivery', page.handleContinueDelivery);
        page.listenTo(page.model, 'change:loading', page.onLoadingChanged);
        page.listenTo(page.lines, 'remove add change', page.onLineUpdated);
        page.listenTo(page.setCarts, 'remove', page.onSetCartRemoved);
        page.listenTo(page.setCarts, 'add', page.onSetCartAdded);
        page.listenTo(page.setCarts, 'change', page.onSetCartChanged);

        page.model.set('loading', false);

        window.parent.postMessage({type: 'ready', app: window.WMES_APP_ID}, '*');
      });

      $(window)
        .on('keydown.' + page.idPrefix, page.onWindowKeyDown.bind(page))
        .on('keypress.' + page.idPrefix, page.onWindowKeyPress.bind(page))
        .on('resize.' + page.idPrefix, page.onWindowResize.bind(page));
    },

    load: function(when)
    {
      return when(
        this.lines.fetch({reset: true}),
        this.pendingDeliveries.fetch({reset: true}),
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
        page.lines.fetch({reset: true}),
        page.pendingDeliveries.fetch({reset: true}),
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

    onPendingDeliveriesUpdated: function(message)
    {
      var page = this;

      if (page.model.get('loading'))
      {
        return;
      }

      (message.deleted || []).forEach(function(pendingDelivery)
      {
        page.pendingDeliveries.remove(pendingDelivery._id);
        page.scheduleLineUpdate(null, true);
      });

      (message.added || []).forEach(function(pendingDelivery)
      {
        page.pendingDeliveries.add(pendingDelivery);
        page.scheduleLineUpdate(null, true);
      });
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

        if (setCart.status === 'completed' || setCart.status === 'delivering')
        {
          page.setCarts.add(WhSetCart.parse(setCart));
        }
      });

      (message.updated || []).forEach(function(update)
      {
        if (update.status && update.status !== 'completed' && update.status !== 'delivering')
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

    onLoadingChanged: function()
    {
      if (!this.model.get('loading'))
      {
        this.reset();
      }
    },

    reset: function()
    {
      var page = this;
      var completed = [];
      var pending = [];
      var delivering = [];

      page.setCarts.forEach(function(setCart)
      {
        if (setCart.get('status') === 'delivering')
        {
          delivering.push(setCart);
        }
        else if (page.isPendingSetCart(setCart))
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

      if (setCart.get('status') === 'completed')
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

    isPendingSetCart: function(setCart)
    {
      var page = this;

      if (page.pendingDeliveries.isPendingSetCart(setCart))
      {
        return true;
      }

      var now = time.getMoment(Date.now()).utc(true).valueOf();
      var minTimeForDelivery = page.whSettings.getMinTimeForDelivery();
      var maxDeliveryStartTime = page.whSettings.getMaxDeliveryStartTime();
      var startTime = Date.parse(setCart.get('startTime'));
      var startTimeDiff = startTime - now;
      var timeForDelivery = startTimeDiff < maxDeliveryStartTime;
      var line = setCart.get('lines').find(function(lineId)
      {
        var whLine = page.lines.get(lineId);

        if (!whLine)
        {
          return false;
        }

        if (whLine.get('components').time >= minTimeForDelivery)
        {
          return false;
        }

        return whLine.get('working') || timeForDelivery;
      });

      return !!line;
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

      setCarts.completed.forEach(function(setCart)
      {
        if (page.isPendingSetCart(setCart))
        {
          completed.remove.push(setCart);
          pending.add.push(setCart);
        }
      });

      setCarts.pending.forEach(function(setCart)
      {
        if (!page.isPendingSetCart(setCart))
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
      var $hd = $('.hd');
      var $ft = $('.ft');
      var $title = this.$('.wh-delivery-section-hd').first();

      var height = window.innerHeight - 30;

      if ($hd.length && !$hd.hasClass('hidden'))
      {
        height -= $hd.outerHeight();
      }

      if ($ft.length && !$ft.hasClass('hidden'))
      {
        height -= $ft.outerHeight() + 15;
      }

      height -= $title.outerHeight(true);

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

      if (viewport.currentDialog instanceof DeliverySetView
        && viewport.currentDialog.model.personnelId === personnelId)
      {
        viewport.currentDialog.finish();

        return;
      }

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

      this.showSetDialog(setCarts, res.user);
    },

    showSetDialog: function(setCarts, user, personnelId)
    {
      if (!setCarts.length)
      {
        console.warn('Showing set dialog with no carts?!?!');

        return;
      }

      var dialogView = new DeliverySetView({
        model: {
          setCarts: setCarts,
          personnelId: personnelId
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

      $message.stop(true, true);
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

    scheduleLineReload: function()
    {
      var page = this;

      clearTimeout(page.timers.lineReload);

      page.timers.lineReload = setTimeout(
        function() { page.promised(page.lines.fetch()); },
        20000
      );
    }

  });
});
