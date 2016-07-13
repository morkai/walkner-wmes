// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/user',
  'app/i18n',
  'app/viewport',
  'app/updater/index',
  'app/core/View',
  'app/data/prodLog',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/prodShifts/ProdShift',
  'app/prodDowntimes/ProdDowntime',
  'app/isa/IsaRequest',
  '../views/ProductionControlsView',
  '../views/ProductionHeaderView',
  '../views/ProductionDataView',
  '../views/ProdDowntimeListView',
  '../views/ProductionQuantitiesView',
  '../views/IsaView',
  '../views/SpigotCheckerView',
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
  prodLog,
  aors,
  downtimeReasons,
  ProdShift,
  ProdDowntime,
  IsaRequest,
  ProductionControlsView,
  ProductionHeaderView,
  ProductionDataView,
  ProdDowntimeListView,
  ProductionQuantitiesView,
  IsaView,
  SpigotCheckerView,
  productionPageTemplate,
  duplicateWarningTemplate
) {
  'use strict';

  return View.extend({

    template: productionPageTemplate,

    layoutName: 'blank',

    remoteTopics: function()
    {
      var topics = {};

      topics['isaRequests.created.' + this.model.prodLine.id + '.**'] = 'onIsaRequestUpdated';
      topics['isaRequests.updated.' + this.model.prodLine.id + '.**'] = 'onIsaRequestUpdated';

      return topics;
    },

    localTopics: {
      'socket.connected': function()
      {
        this.joinProduction();
      },
      'socket.disconnected': function()
      {
        this.productionJoined = false;
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
      }
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
      this.productionJoined = false;
      this.enableProdLog = false;
      this.pendingIsaChanges = [];

      updater.disableViews();

      this.defineViews();
      this.defineBindings();

      $(window)
        .on('resize.' + this.idPrefix, this.onWindowResize)
        .on('beforeunload.' + this.idPrefix, this.onBeforeUnload)
        .on('keydown.' + this.idPrefix, this.onKeyDown);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      $(document.body).removeClass('is-production');

      this.layout = null;
      this.shiftEditedSub = null;

      $(window).off('.' + this.idPrefix);

      this.model.stopShiftChangeMonitor();

      updater.enableViews();
      prodLog.disable();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        locked: this.model.isLocked(),
        state: this.model.get('state'),
        mechOrder: !!this.model.prodShiftOrder.get('mechOrder')
      };
    },

    load: function(when)
    {
      viewport.msg.loading();

      var page = this;
      var enableDeferred = $.Deferred();
      var loadDeferred = $.Deferred();

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
        viewport.msg.loaded();

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

      page.controlsView = new ProductionControlsView({model: model});
      page.headerView = new ProductionHeaderView({model: model});
      page.dataView = new ProductionDataView({model: model});
      page.downtimesView = new ProdDowntimeListView({model: model});
      page.quantitiesView = new ProductionQuantitiesView({model: model});
      page.isaView = new IsaView({model: model});

      var idPrefix = '#' + page.idPrefix + '-';

      page.setView(idPrefix + 'controls', page.controlsView);
      page.setView(idPrefix + 'header', page.headerView);
      page.setView(idPrefix + 'data', page.dataView);
      page.setView(idPrefix + 'downtimes', page.downtimesView);
      page.setView(idPrefix + 'quantities', page.quantitiesView);
      page.setView(idPrefix + 'isa', page.isaView);
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

      page.listenTo(model, 'change:_id', page.subscribeForShiftChanges);

      if (model.id)
      {
        this.subscribeForShiftChanges();
      }

      page.listenTo(model.prodDowntimes, 'change:finishedAt', function()
      {
        page.updateCurrentDowntime();
      });

      page.listenTo(model, 'second', function()
      {
        page.updateCurrentDowntime();
      });

      page.listenTo(model, 'incomingAutoDowntime', page.handleIncomingAutoDowntime);

      page.listenTo(model.prodShiftOrder, 'change:mechOrder', function()
      {
        page.$el.toggleClass('is-mechOrder', model.prodShiftOrder.isMechOrder());
      });

      page.listenTo(page.downtimesView, 'corroborated', function()
      {
        model.saveLocalData();
      });

      page.socket.on('production.locked', page.broker.publish.bind(page.broker, 'production.locked'));
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
      $(document.body).addClass('is-production');

      if (this.socket.isConnected())
      {
        this.joinProduction();
      }

      this.updateCurrentDowntime();

      if (this.model.isLocked() || this.model.id)
      {
        this.$el.removeClass('hidden');
      }
    },

    onKeyDown: function(e)
    {
      var tagName = e.target.tagName;
      var formField = (tagName === 'INPUT' && e.target.type !== 'BUTTON')
        || tagName === 'SELECT'
        || tagName === 'TEXTAREA';

      if (e.keyCode === 8 && (!formField || e.target.readOnly || e.target.disabled))
      {
        e.preventDefault();
      }
    },

    onBeforeUnload: function()
    {
      if (this.model.isLocked())
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
        prodDowntimeId: unfinishedProdDowntime ? unfinishedProdDowntime.id : null
      };

      this.socket.emit('production.join', req, function(res)
      {
        if (!res)
        {
          return;
        }

        if (res.plannedQuantities)
        {
          model.updatePlannedQuantities(res.plannedQuantities);
        }

        if (res.prodDowntimes)
        {
          model.prodDowntimes.reset(
            res.prodDowntimes.map(function(d) { return ProdDowntime.parse(d); })
          );
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
      });

      this.productionJoined = true;
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

      this.productionJoined = false;
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

    checkSpigot: function()
    {
      var model = this.model;
      var spigot = model.prodShiftOrder.get('spigot') || null;

      if (model.get('state') !== 'downtime'
        || spigot
        || !model.isSpigotLine())
      {
        return;
      }

      var settings = model.settings;
      var expectedReason = settings.getValue('rearmDowntimeReason');
      var actualReason = model.prodDowntimes.findFirstUnfinished().get('reason');

      if (actualReason !== expectedReason)
      {
        return;
      }

      var spigotComponent = model.getSpigotComponent();

      if (spigotComponent)
      {
        this.showSpigotDialog(spigotComponent);
      }
    },

    showSpigotDialog: function(spigotComponent)
    {
      var dialogView = new SpigotCheckerView({
        model: this.model,
        component: spigotComponent
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
      var downtime = this.model.prodDowntimes.findFirstUnfinished();
      var reason;
      var aor;
      var elapsedTime;
      var duration;

      if (!downtime)
      {
        var incomingAutoDowntime = this.incomingAutoDowntime;

        if (!incomingAutoDowntime)
        {
          $currentDowntime.addClass('hidden');

          return;
        }

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
/*
      if (!downtime || this.model.get('state') !== 'downtime')
      {
        $currentDowntime.addClass('hidden');

        return;
      }

      this.$id('currentDowntime-reason').text(downtime.getReasonLabel());
      this.$id('currentDowntime-aor').text(downtime.getAorLabel());
      this.$id('currentDowntime-elapsedTime').text(downtime.getDurationString(null, true));

      var auto = downtime.get('auto') || {d: 0};

      if (auto && auto.d)
      {
        this.$id('currentDowntime-duration').text(time.toString(auto.d * 60)).removeClass('hidden');
      }
      else
      {
        this.$id('currentDowntime-duration').addClass('hidden');
      }

      $currentDowntime.removeClass('hidden');

      this.adjustCurrentDowntimeBox();
      */
    },

    handleIncomingAutoDowntime: function(incomingAutoDowntime)
    {
      var page = this;

      page.incomingAutoDowntime = incomingAutoDowntime;

      clearTimeout(page.timers.resetIncomingAutoDowntime);
      page.timers.resetIncomingAutoDowntime = setTimeout(function() { page.incomingAutoDowntime = null; }, 1337);
    }

  });
});
