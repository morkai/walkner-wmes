// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/user',
  'app/i18n',
  'app/viewport',
  'app/updater/index',
  'app/core/View',
  'app/core/util/embedded',
  'app/data/prodLog',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/data/dictionaries',
  'app/prodShifts/ProdShift',
  'app/prodDowntimes/ProdDowntime',
  'app/isa/IsaRequest',
  '../snManager',
  '../views/VkbView',
  '../views/ProductionControlsView',
  '../views/ProductionHeaderView',
  '../views/ProductionDataView',
  '../views/ProdDowntimeListView',
  '../views/ProductionQuantitiesView',
  '../views/IsaView',
  '../views/TaktTimeView',
  '../views/SpigotCheckerView',
  '../views/ExecutionView',
  'app/production/templates/productionPage',
  'app/production/templates/duplicateWarning'
], function(
  _,
  $,
  time,
  user,
  t,
  viewport,
  updater,
  View,
  embedded,
  prodLog,
  aors,
  downtimeReasons,
  dictionaries,
  ProdShift,
  ProdDowntime,
  IsaRequest,
  snManager,
  VkbView,
  ProductionControlsView,
  ProductionHeaderView,
  ProductionDataView,
  ProdDowntimeListView,
  ProductionQuantitiesView,
  IsaView,
  TaktTimeView,
  SpigotCheckerView,
  ExecutionView,
  productionPageTemplate,
  duplicateWarningTemplate
) {
  'use strict';

  var IS_EMBEDDED = true; // TODO window.parent !== window;

  return View.extend({

    template: productionPageTemplate,

    layoutName: 'blank',

    remoteTopics: function()
    {
      var topics = {};
      var prodLineId = this.model.prodLine.id;

      if (prodLineId)
      {
        topics['production.messageRequested.' + prodLineId] = 'onMessageRequested';
        topics['production.autoDowntimes.' + this.model.get('subdivision')] = 'onSubdivisionAutoDowntime';
        topics['production.autoDowntimes.' + prodLineId] = 'onLineAutoDowntime';
        topics['production.taktTime.snChecked.' + prodLineId] = 'onSnChecked';
        topics['isaRequests.created.' + prodLineId + '.**'] = 'onIsaRequestUpdated';
        topics['isaRequests.updated.' + prodLineId + '.**'] = 'onIsaRequestUpdated';
        topics['orders.updated.*'] = 'onOrderUpdated';
      }

      return topics;
    },

    localTopics: {
      'socket.connected': function()
      {
        this.joinProduction();
      },
      'socket.disconnected': function()
      {
        this.leaveProduction();
      },
      'updater.frontendReloading': function()
      {
        this.model.saveLocalData();
      },
      'router.dispatching': function(message)
      {
        if (message.path !== '/production/' + this.model.prodLine.id)
        {
          this.leaveProduction();
        }
      },
      'production.locked': 'onProductionLocked',
      'production.duplicateDetected': 'onDuplicateDetected'
    },

    events: {
      'click #-currentDowntime': function()
      {
        var downtime = this.model.prodDowntimes.findFirstUnfinished();

        if (downtime)
        {
          this.downtimesView.showEditDialog(downtime.id);
        }
      },

      'focusin': function()
      {
        clearTimeout(this.timers.blur);
        this.timers.blur = setTimeout(function()
        {
          if (!document.body.classList.contains('modal-open')
            && !document.activeElement.classList.contains('form-control'))
          {
            document.activeElement.blur();
          }
        }, 5000);
      },

      'click #-message': 'hideMessage'
    },

    breadcrumbs: function()
    {
      return [
        t('production', 'breadcrumbs:base'),
        this.model.getLabel()
      ];
    },

    initialize: function()
    {
      this.delayProductionJoin = this.delayProductionJoin.bind(this);
      this.onBeforeUnload = this.onBeforeUnload.bind(this);
      this.onWindowResize = _.debounce(this.onWindowResize.bind(this), 33);

      this.layout = null;
      this.shiftEditedSub = null;
      this.qtyDoneSub = null;
      this.productionJoined = 0;
      this.enableProdLog = false;
      this.pendingIsaChanges = [];

      updater.disableViews();

      this.defineViews();
      this.defineBindings();

      $(window)
        .on('resize.' + this.idPrefix, this.onWindowResize)
        .on('beforeunload.' + this.idPrefix, this.onBeforeUnload);

      if (IS_EMBEDDED)
      {
        $(window).on('contextmenu.' + this.idPrefix, function(e) { e.preventDefault(); });
      }

      snManager.bind(this);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      $(document.body).removeClass('is-production is-embedded');
      $('.modal').addClass('fade');

      this.layout = null;
      this.shiftEditedSub = null;

      $(window).off('.' + this.idPrefix);

      this.model.stopShiftChangeMonitor();

      updater.enableViews();
      prodLog.disable();
    },

    getTemplateData: function()
    {
      return {
        locked: this.model.isLocked(),
        state: this.model.get('state'),
        mechOrder: !!this.model.prodShiftOrder.get('mechOrder'),
        showBottomControls: IS_EMBEDDED
      };
    },

    load: function(when)
    {
      var page = this;
      var enableDeferred = $.Deferred(); // eslint-disable-line new-cap
      var loadDeferred = $.Deferred(); // eslint-disable-line new-cap

      enableDeferred.done(function()
      {
        page.timers.readLocalData = setTimeout(function()
        {
          page.timers.readLocalData = null;
          page.model.readLocalData();
        }, 1);
      });

      enableDeferred.fail(function()
      {
        document.body.innerHTML = duplicateWarningTemplate();
      });

      enableDeferred.always(function()
      {
        if (enableDeferred.state() === 'rejected')
        {
          page.enableProdLog = false;

          loadDeferred.reject();
        }
        else
        {
          page.enableProdLog = true;

          loadDeferred.resolve();
        }
      });

      prodLog.enable(enableDeferred);

      return when(loadDeferred.promise());
    },

    defineViews: function()
    {
      var page = this;
      var model = page.model;

      page.vkbView = new VkbView();
      page.controlsView = new ProductionControlsView({
        model: model,
        embedded: IS_EMBEDDED,
        vkb: page.vkbView
      });
      page.headerView = new ProductionHeaderView({
        model: model,
        embedded: IS_EMBEDDED,
        vkb: page.vkbView
      });
      page.dataView = new ProductionDataView({
        model: model,
        embedded: IS_EMBEDDED,
        vkb: page.vkbView
      });
      page.downtimesView = new ProdDowntimeListView({
        model: model,
        embedded: IS_EMBEDDED,
        vkb: page.vkbView
      });
      page.taktTimeView = new TaktTimeView({model: model});
      page.quantitiesView = new ProductionQuantitiesView({
        model: model,
        embedded: IS_EMBEDDED,
        vkb: page.vkbView
      });
      page.isaView = new IsaView({
        model: model,
        embedded: IS_EMBEDDED,
        vkb: page.vkbView
      });
      page.executionView = new ExecutionView({
        model: model
      });

      var idPrefix = '#' + page.idPrefix + '-';

      page.setView(idPrefix + 'controls', page.controlsView);
      page.setView(idPrefix + 'header', page.headerView);
      page.setView(idPrefix + 'data', page.dataView);
      page.setView(idPrefix + 'execution', page.executionView);
      page.setView(idPrefix + 'downtimes', page.downtimesView);
      page.setView(idPrefix + 'taktTime', page.taktTimeView);
      page.setView(idPrefix + 'quantities', page.quantitiesView);
      page.setView(idPrefix + 'isa', page.isaView);

      if (IS_EMBEDDED)
      {
        page.setView(idPrefix + 'vkb', page.vkbView);
      }
    },

    defineBindings: function()
    {
      var page = this;
      var model = page.model;

      page.listenTo(model, 'locked', function()
      {
        page.$el.removeClass('is-unlocked').addClass('is-locked');
        page.leaveProduction();
      });

      page.listenTo(model, 'unlocked', function()
      {
        page.$el.removeClass('is-locked').addClass('is-unlocked');
        page.joinProduction();
      });

      page.listenTo(model, 'change:state', function()
      {
        if (page.layout !== null)
        {
          page.layout.setBreadcrumbs(page.breadcrumbs, page);
        }

        var oldState = model.previous('state');
        var newState = model.get('state');

        if (oldState)
        {
          page.$el.removeClass('is-' + oldState);
        }

        if (newState)
        {
          page.$el.addClass('is-' + newState);
        }

        page.checkSpigot();
        page.updateCurrentDowntime();
      });

      page.listenTo(model, 'change:shift', function()
      {
        viewport.closeAllDialogs();

        if (page.$el.hasClass('hidden'))
        {
          page.$el.removeClass('hidden');

          return;
        }

        if (model.get('shift'))
        {
          viewport.msg.show({
            type: 'info',
            time: 2000,
            text: t('production', 'msg:shiftChange')
          });
        }
      });

      page.listenTo(model, 'change:_id', function()
      {
        page.subscribeForShiftChanges();
        page.loadOrderQueue();
      });

      page.listenTo(model.prodShiftOrder, 'change:orderId', page.subscribeForQuantityDoneChanges);

      if (model.id)
      {
        this.subscribeForShiftChanges();
      }

      if (model.prodShiftOrder.get('orderId'))
      {
        this.subscribeForQuantityDoneChanges();
      }

      page.listenTo(model.prodDowntimes, 'change:finishedAt', function()
      {
        page.updateCurrentDowntime();
      });

      page.listenTo(model, 'second', function()
      {
        page.updateCurrentDowntime();
      });

      page.listenTo(model, 'orderCorrected', function()
      {
        page.checkSpigot();
      });

      page.listenTo(model.prodShiftOrder, 'change:mechOrder', function()
      {
        page.$el.toggleClass('is-mechOrder', model.prodShiftOrder.isMechOrder());
      });

      this.listenTo(model.settings, 'reset change', this.toggleTaktTimeView);

      page.listenTo(page.downtimesView, 'corroborated', function()
      {
        model.saveLocalData();
      });

      page.socket.on('production.locked', function()
      {
        page.broker.publish(page.broker, 'production.locked');
      });
    },

    beforeRender: function()
    {
      if (this.enableProdLog)
      {
        prodLog.enable();

        this.enableProdLog = false;
      }
    },

    afterRender: function()
    {
      $(document.body)
        .addClass('is-production')
        .toggleClass('is-embedded', IS_EMBEDDED);
      $('.modal.fade').removeClass('fade');

      this.toggleTaktTimeView();

      if (this.socket.isConnected())
      {
        this.joinProduction();
      }

      this.updateCurrentDowntime();

      if (this.model.isLocked() || this.model.id)
      {
        this.$el.removeClass('hidden');
      }

      if (IS_EMBEDDED)
      {
        window.parent.postMessage({type: 'ready', app: 'operator'}, '*');
      }

      embedded.render(this);

      if (this.model.isLocked())
      {
        this.controlsView.unlock();
      }
    },

    onBeforeUnload: function()
    {
      if (this.model.isLocked() || IS_EMBEDDED)
      {
        return;
      }

      prodLog.disable();

      if (this.model.isIdle() || updater.isFrontendReloading())
      {
        return;
      }

      this.timers.enableProdLog = setTimeout(prodLog.enable.bind(prodLog), 1000);

      return this.model.isDowntime()
        ? t('production', 'unload:downtime')
        : t('production', 'unload:order');
    },

    onWindowResize: function()
    {
      this.adjustCurrentDowntimeBox();
    },

    onProductionLocked: function(data)
    {
      if (data.prodLine === this.model.prodLine.id && data.secretKey === this.model.getSecretKey())
      {
        this.model.setSecretKey(null);

        viewport.msg.show({
          time: 5000,
          type: 'warning',
          text: t('production', 'msg:locked')
        });

        this.$el.removeClass('hidden');
      }
    },

    onDuplicateDetected: function()
    {
      this.remove();

      document.body.innerHTML = duplicateWarningTemplate();
    },

    onIsaRequestUpdated: function(change)
    {
      if (this.pendingIsaChanges)
      {
        this.pendingIsaChanges.push(change);
      }
      else
      {
        this.applyIsaChange(change);
      }
    },

    onOrderUpdated: function(message)
    {
      var pso = this.model.prodShiftOrder;

      if (message._id !== pso.get('orderId'))
      {
        return;
      }

      var qtyMax = message.change.newValues.qtyMax;

      if (qtyMax === undefined)
      {
        return;
      }

      pso.trigger('qtyMaxChanged', qtyMax);
    },

    applyIsaChange: function(change)
    {
      change = IsaRequest.parse(change);

      var isaRequests = this.model.isaRequests;
      var isaRequest = isaRequests.get(change._id);

      if (isaRequest)
      {
        isaRequest.set(change);
      }
      else
      {
        isaRequests.add(change);

        isaRequest = isaRequests.get(change._id);
      }

      if (isaRequest.isCompleted())
      {
        isaRequests.remove(isaRequest);
      }
    },

    joinProduction: function()
    {
      var page = this;
      var model = page.model;

      if (page.timers.joinProduction)
      {
        clearTimeout(page.timers.joinProduction);
        delete page.timers.joinProduction;
      }

      if (page.productionJoined || model.isLocked() || !page.socket.isConnected())
      {
        return;
      }

      if (prodLog.isSyncing())
      {
        return page.broker.subscribe('production.synced', page.delayProductionJoin).setLimit(1);
      }

      if (!model.id)
      {
        return page.listenToOnce(model, 'change:_id', page.delayProductionJoin);
      }

      if (!this.pendingIsaChanges)
      {
        this.pendingIsaChanges = [];
      }

      var unfinishedProdDowntime = model.prodDowntimes.findFirstUnfinished();
      var req = {
        prodLineId: model.prodLine.id,
        prodShiftId: model.id,
        prodShiftOrderId: model.prodShiftOrder.id || null,
        prodDowntimeId: unfinishedProdDowntime ? unfinishedProdDowntime.id : null,
        orderNo: model.prodShiftOrder.get('orderId') || null,
        dictionaries: {},
        orderQueue: true
      };

      _.forEach(dictionaries, function(collection, moduleName)
      {
        if (!/^[A-Z0-9_]+$/.test(moduleName))
        {
          req.dictionaries[moduleName] = collection.updatedAt;
        }
      });

      this.socket.emit('production.join', req, function(res)
      {
        if (!res)
        {
          return;
        }

        if (res.totalQuantityDone)
        {
          model.prodShiftOrder.set('totalQuantityDone', res.totalQuantityDone);
        }

        if (res.plannedQuantities)
        {
          if (res.actualQuantities)
          {
            model.updateQuantities(res.plannedQuantities, res.actualQuantities);
          }
          else
          {
            model.updatePlannedQuantities(res.plannedQuantities);
          }
        }

        if (res.prodDowntimes)
        {
          model.prodDowntimes.refresh(res.prodDowntimes);
        }

        if (res.settings)
        {
          model.settings.reset(res.settings);
        }

        if (res.isaRequests)
        {
          model.isaRequests.reset(
            res.isaRequests.map(function(d) { return IsaRequest.parse(d); })
          );

          if (page.pendingIsaChanges)
          {
            page.pendingIsaChanges.forEach(page.applyIsaChange, page);
            page.pendingIsaChanges = null;
          }
        }

        if (!_.isEmpty(res.orderQueue))
        {
          model.setNextOrder(res.orderQueue);
        }

        if (!_.isEmpty(res.execution))
        {
          model.execution.set(res.execution);
        }

        _.forEach(res.dictionaries, function(models, dictionaryName)
        {
          dictionaries[dictionaryName].reset(models);
        });
      });

      this.productionJoined = Date.now();
    },

    leaveProduction: function()
    {
      if (!this.productionJoined)
      {
        return;
      }

      if (this.socket.isConnected())
      {
        this.socket.emit('production.leave', this.model.prodLine.id);
      }

      this.productionJoined = 0;
    },

    delayProductionJoin: function()
    {
      var page = this;

      if (page.timers.joinProduction)
      {
        clearTimeout(page.timers.joinProduction);
      }

      page.timers.joinProduction = setTimeout(
        function()
        {
          page.timers.joinProduction = null;
          page.joinProduction();
        },
        333
      );
    },

    subscribeForShiftChanges: function()
    {
      if (this.shiftEditedSub)
      {
        this.shiftEditedSub.cancel();
        this.shiftEditedSub = null;
      }

      var model = this.model;

      if (!model.id)
      {
        return;
      }

      this.shiftEditedSub = this.pubsub.subscribe(
        'production.edited.shift.' + model.id,
        function(changes) { model.set(changes); }
      );
    },

    subscribeForQuantityDoneChanges: function()
    {
      if (this.qtyDoneSub)
      {
        this.qtyDoneSub.cancel();
        this.qtyDoneSub = null;
      }

      var model = this.model.prodShiftOrder;
      var orderNo = model.get('orderId');

      if (!orderNo)
      {
        return;
      }

      this.qtyDoneSub = this.pubsub.subscribe(
        'orders.quantityDone.' + orderNo,
        function(totalQuantityDone) { model.set({totalQuantityDone: totalQuantityDone}); }
      );

      this.ajax({url: '/orders?_id=' + orderNo + '&select(qtyDone)&limit(1)'}).done(function(res)
      {
        if (!res.collection || !res.collection.length)
        {
          return;
        }

        var order = res.collection[0];

        if (order && order._id === model.get('orderId'))
        {
          model.set('totalQuantityDone', order.qtyDone);
        }
      });
    },

    loadOrderQueue: function()
    {
      var page = this;

      if (!page.productionJoined || page.model.hasOrderQueue() || !page.model.id)
      {
        return;
      }

      page.ajax({url: '/production/planExecution/' + page.model.id}).done(function(result)
      {
        page.model.setNextOrder(result.orderQueue);
        page.model.execution.set(result.execution);
      });
    },

    checkSpigot: function()
    {
      var model = this.model;
      var spigot = model.prodShiftOrder.get('spigot') || null;
      var spigotComponent = model.getSpigotComponent();

      if (!spigotComponent)
      {
        return;
      }

      var spigotInsertComponent = model.getSpigotInsertComponent();

      if (spigotInsertComponent)
      {
        spigotComponent = spigotInsertComponent;
      }

      if (spigot && spigot.forceCheck)
      {
        this.showSpigotDialog(spigotComponent);

        return;
      }

      if (model.get('state') !== 'downtime'
        || spigot
        || !model.isSpigotLine())
      {
        return;
      }

      var settings = model.settings;
      var expectedReason = settings.getValue('rearmDowntimeReason');
      var actualReason = model.prodDowntimes.findFirstUnfinished().get('reason');

      if (actualReason === expectedReason && spigotComponent)
      {
        this.showSpigotDialog(spigotComponent);
      }
    },

    showSpigotDialog: function(spigotComponent)
    {
      var dialogView = new SpigotCheckerView({
        model: this.model,
        component: spigotComponent,
        embedded: IS_EMBEDDED
      });

      this.broker.subscribe('viewport.dialog.hidden')
        .setLimit(1)
        .setFilter(function(v) { return v === dialogView; })
        .on('message', this.checkSpigot.bind(this));

      viewport.showDialog(dialogView, t('production', 'spigotChecker:title'));
    },

    adjustCurrentDowntimeBox: function()
    {
      var $downtimesHeader = this.$id('downtimes-header');
      var offset = $downtimesHeader.offset();

      if (!offset)
      {
        return;
      }

      var $currentDowntime = this.$id('currentDowntime');
      var $message = this.$id('currentDowntime-message').css('margin-top', '');

      $currentDowntime.css({
        top: (offset.top + $downtimesHeader.outerHeight() + 1) + 'px',
        left: offset.left + 'px',
        width: $downtimesHeader.width() + 'px'
      });

      $message.css('margin-top', ($currentDowntime.outerHeight() - $message.outerHeight()) / 2 + 'px');
    },

    updateCurrentDowntime: function()
    {
      var $currentDowntime = this.$id('currentDowntime');
      var incomingAutoDowntime = this.incomingAutoDowntime;
      var downtime = this.model.prodDowntimes.findFirstUnfinished();
      var reason;
      var aor;
      var elapsedTime;
      var duration;

      if (!downtime)
      {
        if (!incomingAutoDowntime)
        {
          $currentDowntime.addClass('hidden');

          return;
        }

        incomingAutoDowntime.remainingTime = incomingAutoDowntime.startingAt - Date.now();

        reason = downtimeReasons.get(incomingAutoDowntime.reason);
        reason = reason ? reason.getLabel() : null;
        aor = aors.get(this.model.getDefaultAor());
        aor = aor ? aor.getLabel() : null;
        elapsedTime = t('production', 'autoDowntimes:remainingTime', {
          time: time.toString(incomingAutoDowntime.remainingTime / 1000, false, false)
        });
        duration = incomingAutoDowntime.duration;

        $currentDowntime.addClass('is-incoming');
      }
      else
      {
        $currentDowntime.removeClass('is-incoming');

        reason = downtime.getReasonLabel();
        aor = downtime.getAorLabel();
        elapsedTime = downtime.getDurationString(null, true);
        duration = (downtime.get('auto') || {d: 0}).d;
      }

      if (!reason || !aor)
      {
        $currentDowntime.addClass('hidden');

        return;
      }

      this.$id('currentDowntime-reason').text(reason);
      this.$id('currentDowntime-aor').text(aor);
      this.$id('currentDowntime-elapsedTime').text(elapsedTime);

      if (duration)
      {
        this.$id('currentDowntime-duration').text(time.toString(duration * 60)).removeClass('hidden');
      }
      else
      {
        this.$id('currentDowntime-duration').addClass('hidden');
      }

      $currentDowntime.removeClass('hidden');

      this.adjustCurrentDowntimeBox();

      if (incomingAutoDowntime && incomingAutoDowntime.remainingTime < -1000)
      {
        this.incomingAutoDowntime = null;

        this.model.startTimedAutoDowntime(incomingAutoDowntime.reason, incomingAutoDowntime.duration);
      }
    },

    onSubdivisionAutoDowntime: function(message)
    {
      this.onAutoDowntime(message, 'subdivision');
    },

    onLineAutoDowntime: function(message)
    {
      this.onAutoDowntime(message, 'prodLine');
    },

    onAutoDowntime: function(message, source)
    {
      if (!this.productionJoined
        || (source === 'subdivision' && this.model.settings.getAutoDowntimes(this.model.prodLine.id).length > 0)
        || !this.model.shouldStartTimedAutoDowntime(message.reason))
      {
        return;
      }

      if (message.remainingTime === -1)
      {
        this.incomingAutoDowntime = null;

        this.model.startTimedAutoDowntime(message.reason, message.duration);
      }
      else
      {
        message.startingAt = Date.now() + message.remainingTime;

        this.incomingAutoDowntime = message;

        this.updateCurrentDowntime();
      }
    },

    createCheckSn: function(scanInfo, bomScanInfo, checkSn)
    {
      var page = this;
      var model = page.model;
      var state = model.get('state');
      var logEntry = prodLog.create(model, 'checkSerialNumber', scanInfo);
      var sapTaktTime = model.prodShiftOrder.getTaktTime();
      var currentOrderNo = model.prodShiftOrder.get('orderId');
      var error;

      if (scanInfo.orderNo === '000000000')
      {
        scanInfo.orderNo = currentOrderNo;
      }

      scanInfo.sapTaktTime = typeof sapTaktTime === 'number' ? sapTaktTime : 0;

      if (state !== 'working')
      {
        error = 'INVALID_STATE:' + state;
      }
      else if (scanInfo.orderNo !== currentOrderNo)
      {
        if (page.socket.isConnected())
        {
          logEntry = snManager.createDynamicLogEntry(scanInfo);
        }
        else
        {
          error = 'INVALID_ORDER';
        }
      }
      else if (snManager.contains(scanInfo._id))
      {
        error = 'ALREADY_USED';
      }

      if (error)
      {
        logEntry.data.error = error;

        prodLog.record(model, logEntry);

        snManager.showMessage(scanInfo, 'error', error);
      }
      else
      {
        checkSn(logEntry, bomScanInfo);
      }
    },

    onSnChecked: function(data)
    {
      if (data && data.result === 'SUCCESS' && data.instanceId !== window.INSTANCE_ID)
      {
        this.model.updateTaktTime(data);
      }
    },

    toggleTaktTimeView: function(setting)
    {
      if (!setting || !setting.id || /taktTime/.test(setting.id))
      {
        this.$('.production-taktTime').toggleClass(
          'hidden', !this.model.isTaktTimeEnabled() || !this.model.settings.showSmiley()
        );
      }
    },

    onMessageRequested: function(message)
    {
      this.showMessage(message.message);
    },

    showMessage: function(message)
    {
      var html = t.has('production', 'message:' + message.code)
        ? t('production', 'message:' + message.code, message)
        : message.text;

      if (!html)
      {
        return;
      }

      if (this.timers.hideMessage)
      {
        clearTimeout(this.timers.hideMessage);
      }

      this.timers.hideMessage = setTimeout(this.hideMessage.bind(this), message.time || 60000);

      this.$id('message-inner')
        .html(html);

      this.$id('message')
        .attr('data-type', message.type || 'info')
        .css({marginTop: ''})
        .removeClass('hidden')
        .css({marginTop: (this.$id('message-outer').outerHeight() / 2 * -1) + 'px'});

      document.body.click();
    },

    hideMessage: function()
    {
      if (this.timers.hideMessage)
      {
        clearTimeout(this.timers.hideMessage);
        this.timers.hideMessage = null;
      }

      this.$id('message').addClass('hidden');
    }

  });
});
