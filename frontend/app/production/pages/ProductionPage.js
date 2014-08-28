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
      this.layout = null;
      this.shiftEditedSub = null;
      this.productionJoined = false;

      updater.disableViews();
      prodLog.enable();

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.onBeforeUnload = this.onBeforeUnload.bind(this);

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
      this.leaveProduction();
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
        this.joinProduction();
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

    joinProduction: function()
    {
      if (this.model.isLocked() || this.productionJoined)
      {
        return;
      }

      var prodDowntime = this.model.prodDowntimes.findFirstUnfinished();

      this.socket.emit('production.join', {
        _id: this.model.prodLine.id,
        user: user.getInfo(),
        time: Date.now(),
        quantitiesDone: this.model.get('quantitiesDone'),
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
        this.socket.emit('production.leave', this.model.prodLine.id);

        this.productionJoined = false;
      }
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
