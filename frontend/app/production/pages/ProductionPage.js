// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/user',
  'app/i18n',
  'app/viewport',
  'app/updater/index',
  'app/core/View',
  'app/data/prodLog',
  'app/prodShifts/ProdShift',
  '../views/ProductionControlsView',
  '../views/ProductionHeaderView',
  '../views/ProductionDataView',
  '../views/ProdDowntimeListView',
  '../views/ProductionQuantitiesView',
  'app/production/templates/productionPage',
  'app/production/templates/duplicateWarning'
], function(
  $,
  user,
  t,
  viewport,
  updater,
  View,
  prodLog,
  ProdShift,
  ProductionControlsView,
  ProductionHeaderView,
  ProductionDataView,
  ProdDowntimeListView,
  ProductionQuantitiesView,
  productionPageTemplate,
  duplicateWarningTemplate
) {
  'use strict';

  return View.extend({

    template: productionPageTemplate,

    layoutName: 'blank',

    localTopics: {
      'socket.connected': function()
      {
        this.joinProduction();
        this.refreshDowntimes();
        this.refreshPlannedQuantities();
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

    breadcrumbs: function()
    {
      return [
        t('production', 'breadcrumbs:productionPage'),
        this.model.getLabel()
      ];
    },

    initialize: function()
    {
      this.delayProductionJoin = this.delayProductionJoin.bind(this);
      this.onBeforeUnload = this.onBeforeUnload.bind(this);

      this.layout = null;
      this.shiftEditedSub = null;
      this.productionJoined = false;
      this.enableProdLog = false;

      updater.disableViews();

      this.defineViews();
      this.defineBindings();

      $(window).on('beforeunload', this.onBeforeUnload);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      this.layout = null;
      this.shiftEditedSub = null;

      $(window).off('beforeunload', this.onBeforeUnload);

      this.model.stopShiftChangeMonitor();

      updater.enableViews();
      prodLog.disable();
    },

    serialize: function()
    {
      return {
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
      this.controlsView = new ProductionControlsView({model: this.model});
      this.headerView = new ProductionHeaderView({model: this.model});
      this.dataView = new ProductionDataView({model: this.model});
      this.downtimesView = new ProdDowntimeListView({model: this.model});
      this.quantitiesView = new ProductionQuantitiesView({model: this.model});

      this.setView('.production-controls-container', this.controlsView);
      this.setView('.production-header-container', this.headerView);
      this.setView('.production-data-container', this.dataView);
      this.setView('.production-downtimes-container', this.downtimesView);
      this.setView('.production-quantities-container', this.quantitiesView);
    },

    defineBindings: function()
    {
      this.listenTo(this.model, 'locked', function()
      {
        this.$el.removeClass('is-unlocked').addClass('is-locked');
        this.leaveProduction();
      });

      this.listenTo(this.model, 'unlocked', function()
      {
        this.$el.removeClass('is-locked').addClass('is-unlocked');
        this.refreshDowntimes();
        this.refreshPlannedQuantities();
        this.joinProduction();
      });

      this.listenTo(this.model, 'change:state', function()
      {
        if (this.layout !== null)
        {
          this.layout.setBreadcrumbs(this.breadcrumbs, this);
        }

        var oldState = this.model.previous('state');
        var newState = this.model.get('state');

        if (oldState)
        {
          this.$el.removeClass('is-' + oldState);
        }

        if (newState)
        {
          this.$el.addClass('is-' + newState);
        }
      });

      this.listenTo(this.model, 'change:shift', function()
      {
        viewport.closeAllDialogs();

        if (this.$el.hasClass('hidden'))
        {
          this.$el.removeClass('hidden');

          return;
        }

        if (this.model.get('shift'))
        {
          viewport.msg.show({
            type: 'info',
            time: 2000,
            text: t('production', 'msg:shiftChange')
          });
        }
      });

      this.listenTo(this.model, 'change:_id', this.subscribeForShiftChanges);

      if (this.model.id)
      {
        this.subscribeForShiftChanges();
      }

      this.listenTo(this.model.prodShiftOrder, 'change:mechOrder', function()
      {
        this.$el.toggleClass('is-mechOrder', this.model.prodShiftOrder.isMechOrder());
      });

      this.listenTo(this.downtimesView, 'corroborated', function()
      {
        this.model.saveLocalData();
      });

      this.socket.on('production.locked', this.broker.publish.bind(this.broker, 'production.locked'));
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
      if (this.socket.isConnected())
      {
        this.joinProduction();
        this.refreshDowntimes();
        this.refreshPlannedQuantities();
      }

      if (this.model.isLocked() || this.model.id)
      {
        this.$el.removeClass('hidden');
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

    refreshDowntimes: function()
    {
      if (prodLog.isSyncing())
      {
        return this.broker.subscribe('production.synced', this.delayDowntimesRefresh.bind(this)).setLimit(1);
      }

      if (this.model.isLocked())
      {
        return this.listenToOnce(this.model, 'unlocked', this.delayDowntimesRefresh);
      }

      if (!this.model.id)
      {
        return this.listenToOnce(this.model, 'change:_id', this.delayDowntimesRefresh);
      }

      if (this.timers.refreshingDowntimes)
      {
        clearTimeout(this.timers.refreshingDowntimes);
      }

      var page = this;

      this.timers.refreshingDowntimes = setTimeout(function()
      {
        delete page.timers.refreshingDowntimes;

        if (!page.socket.isConnected() || page.model.isLocked())
        {
          return;
        }

        var req = page.model.prodDowntimes.fetch({reset: true});

        page.promised(req).done(function() { page.model.saveLocalData(); });
      }, 2500);
    },

    delayDowntimesRefresh: function()
    {
      if (this.timers.refreshDowntimes)
      {
        clearTimeout(this.timers.refreshDowntimes);
      }

      this.timers.refreshDowntimes = setTimeout(function(view)
      {
        view.timers.refreshDowntimes = null;
        view.refreshDowntimes();
      }, 2500, this);
    },

    refreshPlannedQuantities: function()
    {
      if (prodLog.isSyncing())
      {
        return this.broker.subscribe('production.synced', this.delayPlannedQuantitiesRefresh.bind(this)).setLimit(1);
      }

      if (this.model.isLocked())
      {
        return this.listenToOnce(this.model, 'unlocked', this.delayPlannedQuantitiesRefresh);
      }

      if (!this.model.id)
      {
        return this.listenToOnce(this.model, 'change:_id', this.delayPlannedQuantitiesRefresh);
      }

      var page = this;

      this.socket.emit('production.getPlannedQuantities', this.model.id, function(err, plannedQuantities)
      {
        if (!page.shiftEditedSub)
        {
          return;
        }

        if (err)
        {
          return console.error(err);
        }

        page.model.updatePlannedQuantities(plannedQuantities);
      });
    },

    delayPlannedQuantitiesRefresh: function()
    {
      if (this.timers.refreshPlannedQuantities)
      {
        clearTimeout(this.timers.refreshPlannedQuantities);
      }

      this.timers.refreshPlannedQuantities = setTimeout(function(view)
      {
        view.timers.refreshPlannedQuantities = null;
        view.refreshPlannedQuantities();
      }, 5000, this);
    },

    joinProduction: function()
    {
      if (this.timers.joinProduction)
      {
        clearTimeout(this.timers.joinProduction);
        delete this.timers.joinProduction;
      }

      if (this.productionJoined || this.model.isLocked() || !this.socket.isConnected())
      {
        return;
      }

      if (prodLog.isSyncing())
      {
        return this.broker.subscribe('production.synced', this.delayProductionJoin).setLimit(1);
      }

      if (!this.model.id)
      {
        return this.listenToOnce(this.model, 'change:_id', this.delayProductionJoin);
      }

      var prodDowntime = this.model.prodDowntimes.findFirstUnfinished();

      this.socket.emit('production.join', {
        prodLineId: this.model.prodLine.id,
        prodShiftId: this.model.id,
        prodShiftOrderId: this.model.prodShiftOrder.id || null,
        prodDowntimeId: prodDowntime ? prodDowntime.id : null
      });

      this.productionJoined = true;
    },

    leaveProduction: function()
    {
      if (this.productionJoined)
      {
        if (this.socket.isConnected())
        {
          this.socket.emit('production.leave', this.model.prodLine.id);
        }

        this.productionJoined = false;
      }
    },

    delayProductionJoin: function()
    {
      if (this.timers.joinProduction)
      {
        clearTimeout(this.timers.joinProduction);
      }

      this.timers.joinProduction = setTimeout(function(view)
      {
        view.timers.joinProduction = null;
        view.joinProduction();
      }, 1337, this);
    },

    subscribeForShiftChanges: function()
    {
      if (this.shiftEditedSub)
      {
        this.shiftEditedSub.cancel();
      }

      if (!this.model.id)
      {
        return;
      }

      var model = this.model;

      this.shiftEditedSub = this.pubsub
        .subscribe('production.edited.shift.' + this.model.id)
        .on('message', function(changes) { model.set(changes); });
    }

  });
});
