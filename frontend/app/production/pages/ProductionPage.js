define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/data/prodLog',
  '../ProdShift',
  '../views/ProductionControlsView',
  '../views/ProductionHeaderView',
  '../views/ProductionDataView',
  '../views/ProdDowntimeListView',
  '../views/ProductionQuantitiesView',
  'app/production/templates/productionPage'
], function(
  t,
  viewport,
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
      'socket.connected': 'refreshDowntimes'
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
      prodLog.enable();

      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    destroy: function()
    {
      this.model.stopShiftChangeMonitor();

      prodLog.disable();
    },

    serialize: function()
    {
      return {
        locked: this.model.isLocked(),
        state: this.model.get('state')
      };
    },

    defineModels: function()
    {
      this.model.readLocalData();
      this.model.startShiftChangeMonitor();

window.model = this.model;
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

      this.listenTo(this.model.prodShiftOrder, 'change:mechOrder', function()
      {
        this.$el.toggleClass('is-mechOrder', !!this.model.prodShiftOrder.get('mechOrder'));
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
        this.refreshDowntimes();
      }
    },

    refreshDowntimes: function()
    {
      var model = this.model;

      if (!model.prodDowntimes.length)
      {
        return;
      }

      this.promised(model.prodDowntimes.fetch()).then(function()
      {
        model.saveLocalData();
      });
    }

  });
});
