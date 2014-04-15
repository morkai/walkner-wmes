// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
  'app/production/templates/productionPage'
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
  productionPageTemplate
) {
  'use strict';

  return View.extend({

    template: productionPageTemplate,

    layoutName: 'blank',

    localTopics: {
      'socket.connected': function()
      {
        this.setUpTimeLog();
        this.refreshDowntimes();
        this.refreshPlannedQuantities();
      },
      'socket.disconnected': function()
      {
        if (this.timers.diagTimeLog)
        {
          clearTimeout(this.timers.diagTimeLog);
          this.timers.diagTimeLog = null;
        }
      },
      'updater.frontendReloading': function()
      {
        this.model.saveLocalData();
      }
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
      this.shiftEditedSub = null;

      updater.disableViews();
      prodLog.enable();

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.onBeforeUnload = this.onBeforeUnload.bind(this);

      $(window).on('beforeunload', this.onBeforeUnload);
    },

    destroy: function()
    {
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

    defineModels: function()
    {
      this.model.readLocalData();
    },

    defineViews: function()
    {
      this.controlsView = new ProductionControlsView({model: this.model});
      this.headerView = new ProductionHeaderView({model: this.model});
      this.dataView = new ProductionDataView({model: this.model});
      this.downtimesView = new ProdDowntimeListView({
        collection: this.model.prodDowntimes,
        prodLine: this.model.prodLine.id
      });
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
      });

      this.listenTo(this.model, 'unlocked', function()
      {
        this.$el.removeClass('is-locked').addClass('is-unlocked');
        this.refreshDowntimes();
        this.refreshPlannedQuantities();
      });

      this.listenTo(this.model, 'change:state', function()
      {
        var oldState = this.model.previous('state');

        if (oldState !== null)
        {
          this.$el.removeClass('is-' + oldState);
        }

        this.$el.addClass('is-' + this.model.get('state'));
      });

      this.listenTo(this.model, 'change:shift', function()
      {
        viewport.closeAllDialogs();

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
    },

    afterRender: function()
    {
      if (this.socket.isConnected())
      {
        this.setUpTimeLog();
        this.refreshDowntimes();
        this.refreshPlannedQuantities();
      }
    },

    refreshDowntimes: function()
    {
      if (prodLog.isSyncing())
      {
        return this.broker
          .subscribe('production.synced', this.delayDowntimesRefresh.bind(this))
          .setLimit(1);
      }

      if (this.model.isLocked())
      {
        return this.listenToOnce(this.model, 'unlocked', this.delayDowntimesRefresh.bind(this));
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

        page.promised(req).done(function()
        {
          page.model.saveLocalData();
        });
      }, 3000);
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
      if (this.model.isLocked())
      {
        return this.listenToOnce(this.model, 'unlocked', this.refreshPlannedQuantities.bind(this));
      }

      var page = this;

      this.socket.emit(
        'production.getPlannedQuantities',
        this.model.id,
        function(err, plannedQuantities)
        {
          if (err || !page.shiftEditedSub)
          {
            return;
          }

          page.model.updatePlannedQuantities(plannedQuantities);
        }
      );
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

    setUpTimeLog: function()
    {
      if (true || this.timers.diagTimeLog != null)
      {
        return;
      }

      this.socket.emit('diag.log', {
        createdAt: new Date(),
        creator: user.getInfo(),
        prodLine: this.model.prodLine.id,
        type: 'connected',
        data: {
          versions: updater.versions
        }
      });

      this.timers.diagTimeLog = setInterval(this.logTime.bind(this), 60000);
    },

    logTime: function()
    {
      this.socket.emit('diag.log', {
        createdAt: new Date(),
        creator: user.getInfo(),
        prodLine: this.model.prodLine.id,
        type: 'ping',
        data: null
      });
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
