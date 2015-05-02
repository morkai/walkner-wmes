// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/util/bindLoadingMessage',
  'app/delayReasons/storage',
  './DrillingReportPage',
  '../Report2OrderCollection',
  '../Report2Query',
  '../Report2DisplayOptions',
  '../views/Report2HeaderView',
  '../views/Report2FilterView',
  '../views/Report2DisplayOptionsView',
  '../views/Report2ChartsView',
  '../views/Report2OrdersView',
  'app/reports/templates/report2Page'
], function(
  _,
  bindLoadingMessage,
  delayReasonsStorage,
  DrillingReportPage,
  Report2OrderCollection,
  Report2Query,
  Report2DisplayOptions,
  Report2HeaderView,
  Report2FilterView,
  Report2DisplayOptionsView,
  Report2ChartsView,
  Report2OrdersView,
  template
) {
  'use strict';

  return DrillingReportPage.extend({

    template: template,
    rootBreadcrumbKey: 'BREADCRUMBS:2',
    initialSettingsTab: 'clip',
    maxOrgUnitLevel: 'prodFlow',
    pageId: 'report2',

    remoteTopics: {
      'orders.updated.*': 'onOrderUpdated'
    },

    initialize: function()
    {
      DrillingReportPage.prototype.initialize.call(this);

      this.setView('.reports-2-orders-container', this.ordersView);
    },

    destroy: function()
    {
      DrillingReportPage.prototype.destroy.call(this);

      delayReasonsStorage.release();
    },

    defineModels: function()
    {
      DrillingReportPage.prototype.defineModels.call(this);

      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);

      this.orders = bindLoadingMessage(new Report2OrderCollection(null, {
        query: this.query,
        displayOptions: this.displayOptions
      }), this);
      this.paginationData = this.orders.paginationData;
    },

    defineViews: function()
    {
      DrillingReportPage.prototype.defineViews.call(this);

      this.ordersView = new Report2OrdersView({
        collection: this.orders,
        delayReasons: this.delayReasons
      });
    },

    defineBindings: function()
    {
      DrillingReportPage.prototype.defineBindings.call(this);

      this.listenTo(this.orders.paginationData, 'change', function()
      {
        var attrs = {
          limit: this.paginationData.get('limit'),
          skip: this.paginationData.get('skip')
        };

        this.query.set(attrs, {silent: true});
      });

      this.listenTo(this.query, 'change:skip', function()
      {
        this.orders.rqlQuery.skip = this.query.get('skip');
      });

      this.listenTo(this.query, 'change:limit', function()
      {
        this.orders.rqlQuery.limit = this.query.get('limit');
      });
    },

    onQueryChange: function(query, options)
    {
      DrillingReportPage.prototype.onQueryChange.call(this, query, options);

      this.promised(this.orders.fetch({reset: true}));
    },

    onDisplayOptionsChange: function(displayOptions)
    {
      DrillingReportPage.prototype.onDisplayOptionsChange.call(this, displayOptions);

      this.paginationData.set('urlTemplate', this.orders.genPaginationUrlTemplate());
    },

    getQueryDataForOrgUnitChange: function(orgUnit)
    {
      return _.extend(DrillingReportPage.prototype.getQueryDataForOrgUnitChange.call(this, orgUnit), {
        skip: 0
      });
    },

    load: function(when)
    {
      return when(
        this.orders.fetch({reset: true}),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null,
        this.settings.isEmpty() ? this.settings.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      DrillingReportPage.prototype.afterRender.call(this);

      delayReasonsStorage.acquire();
    },

    createQuery: function()
    {
      return new Report2Query(this.options.query);
    },

    createDisplayOptions: function()
    {
      var options = {
        settings: this.settings
      };

      if (typeof this.options.displayOptions === 'string')
      {
        return Report2DisplayOptions.fromString(this.options.displayOptions, options);
      }

      return new Report2DisplayOptions(this.options.displayOptions, options);
    },

    createHeaderView: function()
    {
      return new Report2HeaderView({model: this.query, displayOptions: this.displayOptions});
    },

    createFilterView: function()
    {
      return new Report2FilterView({model: this.query});
    },

    createDisplayOptionsView: function()
    {
      return new Report2DisplayOptionsView({model: this.displayOptions});
    },

    createChartsView: function(report, skipRenderCharts)
    {
      return new Report2ChartsView({
        model: report,
        settings: this.settings,
        displayOptions: this.displayOptions,
        skipRenderCharts: !!skipRenderCharts
      });
    },

    onOrderUpdated: function(message)
    {
      var order = this.orders.get(message._id);

      if (order)
      {
        order.set({
          _id: order.id,
          delayReason: message.delayReason
        });
        order.get('changes').push(message.change);
        order.trigger('push:change', message.change);
        this.orders.trigger('push:change', message.change);
      }
    }

  });
});
